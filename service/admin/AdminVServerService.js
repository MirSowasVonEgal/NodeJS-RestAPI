require("dotenv").config();
var VServer = require('../../model/VServer');
var Network = require('../../model/Network');
var AdminNetworkService = require('./AdminNetworkService');
var SSHService = require('../SSHService');
var { Proxmox } = require('../../core');

exports.createVServer = function(req) {
    return new Promise(function(resolve, reject) {
      if(!(req.body.password && req.body.password.length >= 8)) return reject({ message: "Du musst ein Passwort mit mindestens 8 Zeichen angeben"});
      if(!req.body.memory) return reject({ message: "Du musst den Arbeitsspeicher angeben"});
      if(!req.body.disk) return reject({ message: "Du musst die Festplatte angeben"});
      if(!req.body.cores) return reject({ message: "Du musst die Kerne angeben"});
      if(!req.body.price) return reject({ message: "Du musst einen Preis angeben"});
      if(!req.body.os) return reject({ message: "Du musst ein OS angeben"});
      if(!req.body.duration) return reject({ message: "Du musst eine Dauer angeben"});
      var memory = parseInt(JSON.stringify(req.body.memory).replace(/"/g, ''));
      var disk = parseInt(JSON.stringify(req.body.disk).replace(/"/g, ''));
      var cores = parseInt(JSON.stringify(req.body.cores).replace(/"/g, ''));
      var price = parseInt(JSON.stringify(req.body.price).replace(/"/g, ''));
      var duration = parseInt(JSON.stringify(req.body.duration).replace(/"/g, ''));
      var ipv4s = 1;
      if(req.body.ipv4s)
        ipv4s = parseInt(JSON.stringify(req.body.ipv4s).replace(/"/g, ''));
    var ipv6 = true;
        if(req.body.ipv6)
          ipv6 = parseInt(JSON.stringify(req.body.ipv4s).replace(/"/g, ''));
      if(!req.body.userid) req.body.userid = req.user._id
      Proxmox.run
      Proxmox.getNodes().then(nodes => {
        var node = nodes[0].node;
        Proxmox.getNextVMID().then(nextid => {
            var uuid = generateUUID();
            AdminNetworkService.getIPAddresses(req, ipv6, "IPv6", nextid, uuid, "VServer").then(ipv6_network => {
                AdminNetworkService.getIPAddresses(req, ipv4s, "IPv4", nextid, uuid, "VServer").then(networks => {
                    params = {
                        vmid: nextid,
                        ostemplate: "local:vztmpl/" + req.body.os,
                        storage: 'local-lvm',
                        unprivileged: 1,
                        features: 'keyctl=1,nesting=1',
                        cores: cores,
                        rootfs: disk,
                        memory: memory,
                        password: req.body.password,
                        start: 1,
                    }
                    var i = 0;
                    networks.forEach(network => {
                        params['net' + i] = 'name=eth' + i + ',bridge=vmbr0,firewall=1,ip=' + network.ip + '/' + network.subnet + ',gw=' + network.gateway + ',type=veth'
                        i++;
                    });
                    if(ipv6) {
                        params['net' + i] = 'name=eth' + i + ',bridge=vmbr0,firewall=1,ip6=' + ipv6_network.ip + '/' + ipv6_network.subnet + ',type=veth'
                        if(ipv6_network.gateway != undefined)
                            params['net' + i] = 'name=eth' + i + ',bridge=vmbr0,firewall=1,ip6=' + ipv6_network.ip + '/' + ipv6_network.subnet + ',gw=' + ipv6_network.gateway + ',type=veth'
                    }
                    Proxmox.createLxcContainer(node, params).then(lxc => {
                        if(lxc.status == 200) {
                            new VServer({ _id: uuid, serverid: nextid, userid: req.body.userid, password: req.body.password, os: req.body.os, memory: memory, 
                                cores: cores, disk: disk, node: node, price: price, paidup: new Date().getTime() + (86400000 * duration), status: "Installation", upid: lxc.data.data }).save()
                            .then(vserver => {
                                if(vserver) {
                                    vserver.password = undefined;
                                    resolve({vserver, networks, ipv6_network, message: "Der Server wurde erstellt"})
                                    Proxmox.putAccessAcl({ path: "/vms/"+ vserver.serverid, roles: "VNC", users: req.user._id + "@pve" });
                                    setTimeout(function(){
                                        SSHService.updateAndAllowRoot(vserver.serverid);
                                   }, 1000 * 30);
                                } else {
                                    reject();
                                }
                            });
                        } else {
                            console.log("Error!")
                        }
                    })
                });
            });
        });
      });
    });
}

exports.getVNC = function(req) {
    return new Promise(function(resolve, reject) {
      VServer.findById(req.params.id).then(async vserver => {
        Proxmox.createAccessTicket({ password: Proxmox.ticket, username: req.user._id + "@pve" }).then(lxc => {
            resolve({ url: "https://" + process.env.PROXMOX_HOST + ":8006/?console=lxc&novnc=1&vmid=" + vserver.serverid + "&node=" + vserver.node + "&cmd=", CSRFPreventionToken: lxc.data.data.CSRFPreventionToken, cookie: "PVEAuthCookie=" + lxc.data.data.ticket });
        });
      }).catch(error => {
        reject(error)
      })
    });
}

exports.getVServer = function(req) {
    return new Promise(function(resolve, reject) {
      VServer.findById(req.params.id).then(vserver => {
        Network.find({ serveruuid: req.params.id }).then(networks => {
            Proxmox.getLxcContainerStatus(vserver.node, vserver.serverid).then(status => {
                if(vserver.upid) {
                    Proxmox.getTaskStatus(vserver.node, vserver.upid).then(task => {
                        if(task.exitstatus) {
                            if(task.exitstatus == 'OK') {
                                if(status.status == 'running') {
                                    vserver.status = 'Online' 
                                } else {
                                    vserver.status = 'Offline' 
                                }
                                VServer.findByIdAndUpdate(vserver._id, { status: vserver.status, upid: null }).then();
                            } else {
                                vserver.status = 'Fehler'
                            }
                        } else {
                            switch(task.type) {
                                case 'vzcreate':
                                    vserver.status = 'Installation';
                                    break;
                                case 'vzstart':
                                    vserver.status = 'Startet';
                                    break;
                                case 'vzstop':
                                    vserver.status = 'Gestoppt';
                                    break;
                                case 'vzshutdown':
                                    vserver.status = 'Heruntergefahren';
                                    break
                                case 'vzreboot':
                                    vserver.status = 'Neustart';
                                    break
                                default:
                                    vserver.status = 'Unbekannt'
                                    console.log(task.type);
                                    break;
                            }
                        }
                        resolve({vserver, networks, status});
                    
                    });
                } else {
                    if(status.status == 'running') {
                        vserver.status = 'Online' 
                    } else {
                        vserver.status = 'Offline' 
                    }
                    resolve({vserver, status});
                }
            })
        }).catch(error => {
            reject(error)
        })
    })
    });
}

exports.startVServer = function(req) {
    return new Promise(function(resolve, reject) {
      VServer.findById(req.params.id).then(vserver => {
        Proxmox.startLxcContainer(vserver.node, vserver.serverid).then(lxc => {
            if(lxc == 500) return reject({ message: "Der VServer ist bereits gestartet" });
            resolve({ message: "Der VServer wird gestartet" });
            VServer.findByIdAndUpdate(vserver._id, { upid: lxc.data.data }).then();
        });
      }).catch(error => {
        reject(error)
      })
    });
}

exports.stopVServer = function(req) {
    return new Promise(function(resolve, reject) {
      VServer.findById(req.params.id).then(vserver => {
        Proxmox.stopLxcContainer(vserver.node, vserver.serverid).then(lxc => {
            if(lxc == 500) return reject({ message: "Der VServer ist bereits gestoppt" });
            resolve({ message: "Der VServer wird gestoppt" });
            VServer.findByIdAndUpdate(vserver._id, { upid: lxc.data.data }).then();
        });
      }).catch(error => {
        reject(error)
      })
    });
}

exports.shutdownVServer = function(req) {
    return new Promise(function(resolve, reject) {
      VServer.findById(req.params.id).then(vserver => {
        Proxmox.shutdownLxcContainer(vserver.node, vserver.serverid).then(lxc => {
            if(lxc == 500) return reject({ message: "Der VServer ist bereits abgeschaltet" });
            resolve({ message: "Der VServer wird heruntergefahren" });
            VServer.findByIdAndUpdate(vserver._id, { upid: lxc.data.data }).then();
        });
      }).catch(error => {
        reject(error)
      })
    });
}

exports.rebootVServer = function(req) {
    return new Promise(function(resolve, reject) {
      VServer.findById(req.params.id).then(vserver => {
        Proxmox.rebootLxcContainer(vserver.node, vserver.serverid).then(lxc => {
            if(lxc == 500) return reject({ message: "Der VServer ist offline" });
            resolve({ message: "Der VServer wird neugestartet" });
            VServer.findByIdAndUpdate(vserver._id, { upid: lxc.data.data }).then();
        });
      }).catch(error => {
        reject(error)
      })
    });
}

exports.extendVServer = function(req) {
    return new Promise(function(resolve, reject) {
        if(req.body.duration == null) return reject();
        if(typeof req.body.duration == 'number') return reject();
        VServer.findByIdAndUpdate(req.params.id, { $inc: { paidup: (86400000 * req.body.duration) } }).then();
        resolve({ message: "Der Server wurde erfolgreich verlängert" });
    });
}


exports.getVServers = function(req) {
    return new Promise(async function(resolve, reject) {
        var lxc_status = [];
        var node_tasks = [];
        await new Promise((resolve, reject) => {
            Proxmox.getNodes().then(nodes => {
                var i = 0;
                nodes.forEach(node => {
                    i++;
                    Proxmox.listLxcContainers(node.node).then(lxc_status_ => {
                        Proxmox.getNodeTasks(node.node).then(node_tasks_ => {
                            lxc_status = lxc_status.concat(lxc_status_);
                            node_tasks = node_tasks.concat(node_tasks_);
                            if(nodes.length == i) {
                                resolve();
                            }  
                        });
                    });  
                });
            });
        }); 
        var finalvservers = [];
        VServer.find().then(vservers => {
            vservers.forEach(vserver => {
                var task = node_tasks.find(i =>{
                    if(i == null) return;
                    if(i.id == vserver.serverid) {
                        if(i.status != 'OK' && i.type != 'vncproxy') {
                            if(!(i.endtime)) {
                                return i;
                            }
                        }
                    }
                });
                var status = lxc_status.find(i =>{
                    if(i == null) return;
                    if(i.vmid == vserver.serverid) {
                        if(i.status != 'OK' && i.type != 'vncproxy') {
                            if(!(i.endtime)) {
                                return i;
                            }
                        }
                    }
                });
                if(task != undefined) {
                    switch(task.type) {
                        case 'vzcreate':
                            vserver.status = 'Installation';
                            break;
                        case 'vzstart':
                            vserver.status = 'Startet';
                            break;
                        case 'vzstop':
                            vserver.status = 'Gestoppt';
                            break;
                        case 'vzshutdown':
                            vserver.status = 'Heruntergefahren';
                            break
                        case 'vzreboot':
                            vserver.status = 'Neustart';
                            break
                        default:
                            vserver.status = 'Unbekannt'
                            break;
                    }
                }
                if(status.status == 'running') {
                    vserver.status = 'Online' 
                } else {
                    vserver.status = 'Offline' 
                }
                vserver.password = undefined;
                finalvservers.push({vserver, status})
            });
            resolve({vservers: finalvservers})
        });
    });
}


exports.getVServersByUser = function(req) {
    return new Promise(async function(resolve, reject) {
        var lxc_status = [];
        var node_tasks = [];
        await new Promise((resolve, reject) => {
            Proxmox.getNodes().then(nodes => {
                var i = 0;
                nodes.forEach(node => {
                    i++;
                    Proxmox.listLxcContainers(node.node).then(lxc_status_ => {
                        Proxmox.getNodeTasks(node.node).then(node_tasks_ => {
                            lxc_status = lxc_status.concat(lxc_status_);
                            node_tasks = node_tasks.concat(node_tasks_);
                            if(nodes.length == i) {
                                resolve();
                            }  
                        });
                    });  
                });
            });
        }); 
        var finalvservers = [];
        VServer.find({ userid: req.params.id }).then(vservers => {
            vservers.forEach(vserver => {
                var task = node_tasks.find(i =>{
                    if(i == null) return;
                    if(i.id == vserver.serverid) {
                        if(i.status != 'OK' && i.type != 'vncproxy') {
                            if(!(i.endtime)) {
                                return i;
                            }
                        }
                    }
                });
                var status = lxc_status.find(i =>{
                    if(i == null) return;
                    if(i.vmid == vserver.serverid) {
                        if(i.status != 'OK' && i.type != 'vncproxy') {
                            if(!(i.endtime)) {
                                return i;
                            }
                        }
                    }
                });
                if(task != undefined) {
                    switch(task.type) {
                        case 'vzcreate':
                            vserver.status = 'Installation';
                            break;
                        case 'vzstart':
                            vserver.status = 'Startet';
                            break;
                        case 'vzstop':
                            vserver.status = 'Gestoppt';
                            break;
                        case 'vzshutdown':
                            vserver.status = 'Heruntergefahren';
                            break
                        case 'vzreboot':
                            vserver.status = 'Neustart';
                            break
                        default:
                            vserver.status = 'Unbekannt'
                            break;
                    }
                }
                if(status.status == 'running') {
                    vserver.status = 'Online' 
                } else {
                    vserver.status = 'Offline' 
                }
                vserver.password = undefined;
                finalvservers.push({vserver, status})
            });
            resolve({vservers: finalvservers})
        });
    });
}

function generateUUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}