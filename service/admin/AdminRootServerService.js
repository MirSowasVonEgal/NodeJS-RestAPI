require("dotenv").config();
var RootServer = require('../../model/RootServer');
var Network = require('../../model/Network');
var OS = require('../../model/OS');
var AdminNetworkService = require('./AdminNetworkService');
var { Proxmox } = require('../../core');

exports.createRootServer = function(req) {
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
      OS.findOne({ os: req.body.os }).then(server_os => {
        Proxmox.getNodes().then(nodes => {
            var node = nodes[0].node;
            Proxmox.getNextVMID().then(nextid => {
                var uuid = generateUUID();
                AdminNetworkService.getIPAddresses(req, ipv6, "IPv6", nextid, uuid, "RootServer").then(ipv6_network => {
                    AdminNetworkService.getIPAddresses(req, ipv4s, "IPv4", nextid, uuid, "RootServer").then(networks => {
                        var params = {};
                        var i = 0;
                        networks.forEach(network => {
                            if(ipv6) {
                                params['ipconfig' + i] = 'ip=' + network.ip + '/' + network.subnet + ',gw=' + network.gateway + ',ip6=' + ipv6_network.ip + '/' + ipv6_network.subnet
                                if(ipv6_network.gateway != undefined)
                                    params['ipconfig' + i] =  'ip=' + network.ip + '/' + network.subnet + ',gw=' + network.gateway + ',ip6=' + ipv6_network.ip + '/' + ipv6_network.subnet + ',gw6=' + ipv6_network.gateway
                            } else {
                                params['ipconfig' + i] = 'ip=' + network.ip + '/' + network.subnet + ',gw=' + network.gateway
                            }
                            params.cores = cores;
                            params.memory = memory;
                            params.cipassword = password;
                            ipv6 = false;
                            i++;
                        });
                        Proxmox.cloneQemuVm(node, server_os.number, { newid: nextid, name: "VM" + nextid }).then(qemu => {
                            if(qemu.status == 200) {
                                new RootServer({ _id: uuid, serverid: nextid, userid: req.body.userid, password: req.body.password, os: req.body.os, memory: memory, 
                                    cores: cores, disk: disk, node: node, price: price, paidup: new Date().getTime() + (86400000 * duration), status: "Installation", upid: qemu.data.data }).save()
                                .then(rootserver => {
                                    if(rootserver) {
                                        rootserver.password = undefined;
                                        resolve({rootserver, networks, ipv6_network, message: "Der Server wurde erstellt"})
                                        Proxmox.putAccessAcl({ path: "/vms/"+ rootserver.serverid, roles: "VNC", users: req.user._id + "@pve" });
                                        setTimeout(function(){
                                            Proxmox.setQemuVmConfig(rootserver.node, rootserver.serverid, params);
                                            Proxmox.resizeQemuVm(rootserver.node, rootserver.serverid, { disk: 'scsi0', size: '+' + (disk-10) + 'G'  });
                                       }, 1000 * 60 * 2);
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
    });
}

exports.getVNC = function(req) {
    return new Promise(function(resolve, reject) {
        RootServer.findById(req.params.id).then(rootserver => {
        Proxmox.createAccessTicket({ password: Proxmox.ticket, username: req.user._id + "@pve" }).then(kvm => {
            resolve({ url: "https://" + process.env.PROXMOX_HOST + ":8006/?console=kvm&novnc=1&vmid=" + rootserver.serverid + "&node=" + rootserver.node + "&cmd=", CSRFPreventionToken: kvm.data.data.CSRFPreventionToken, cookie: "PVEAuthCookie=" + kvm.data.data.ticket });
        });
      }).catch(error => {
        reject(error)
      })
    });
}

exports.getRootServer = function(req) {
    return new Promise(function(resolve, reject) {
      RootServer.findById(req.params.id).then(rootserver => {
        Network.find({ serveruuid: req.params.id }).then(networks => {
            Proxmox.getQemuStatus(rootserver.node, rootserver.serverid).then(status => {
                if(rootserver.upid) {
                    Proxmox.getTaskStatus(rootserver.node, rootserver.upid).then(task => {
                        if(task.exitstatus) {
                            if(task.exitstatus == 'OK') {
                                if(status.status == 'running') {
                                    rootserver.status = 'Online' 
                                } else {
                                    rootserver.status = 'Offline' 
                                }
                                RootServer.findByIdAndUpdate(rootserver._id, { status: rootserver.status, upid: null }).then();
                            } else {
                                rootserver.status = 'Fehler'
                            }
                        } else {
                            switch(task.type) {
                                case 'qmcreate':
                                    rootserver.status = 'Installation';
                                    break;
                                case 'qmclone':
                                    rootserver.status = 'Installation';
                                    break;
                                case 'qmstart':
                                    rootserver.status = 'Startet';
                                    break;
                                case 'qmstop':
                                    rootserver.status = 'Gestoppt';
                                    break;
                                case 'qmshutdown':
                                    rootserver.status = 'Heruntergefahren';
                                    break
                                case 'qmreboot':
                                    rootserver.status = 'Neustart';
                                    break
                                default:
                                    rootserver.status = 'Unbekannt'
                                    console.log(task.type);
                                    break;
                            }
                        }
                        resolve({rootserver, networks, status});
                    
                    });
                } else {
                    if(status.status == 'running') {
                        rootserver.status = 'Online' 
                    } else {
                        rootserver.status = 'Offline' 
                    }
                    resolve({rootserver, status});
                }
            })
        }).catch(error => {
            reject(error)
        })
    })
    });
}

exports.startRootServer = function(req) {
    return new Promise(function(resolve, reject) {
      RootServer.findById(req.params.id).then(rootserver => {
        Proxmox.startQemuVm(rootserver.node, rootserver.serverid).then(kvm => {
            if(kvm == 500) return reject({ message: "Der RootServer ist bereits gestartet" });
            resolve({ message: "Der RootServer wird gestartet" });
            RootServer.findByIdAndUpdate(rootserver._id, { upid: kvm.data.data }).then();
        });
      }).catch(error => {
        reject(error)
      })
    });
}

exports.stopRootServer = function(req) {
    return new Promise(function(resolve, reject) {
      RootServer.findById(req.params.id).then(rootserver => {
        Proxmox.stopQemuVm(rootserver.node, rootserver.serverid).then(kvm => {
            if(kvm == 500) return reject({ message: "Der RootServer ist offline" });
            resolve({ message: "Der RootServer wird gestoppt" });
            RootServer.findByIdAndUpdate(rootserver._id, { upid: kvm.data.data }).then();
        });
      }).catch(error => {
        reject(error)
      })
    });
}

exports.shutdownRootServer = function(req) {
    return new Promise(function(resolve, reject) {
      RootServer.findById(req.params.id).then(rootserver => {
        Proxmox.shutdownQemuVm(rootserver.node, rootserver.serverid).then(kvm => {
            if(kvm == 500) return reject({ message: "Der RootServer ist offline" });
            resolve({ message: "Der RootServer wird heruntergefahren" });
            RootServer.findByIdAndUpdate(rootserver._id, { upid: kvm.data.data }).then();
        });
      }).catch(error => {
        reject(error)
      })
    });
}

exports.rebootRootServer = function(req) {
    return new Promise(function(resolve, reject) {
      RootServer.findById(req.params.id).then(rootserver => {
        Proxmox.rebootQemuVm(rootserver.node, rootserver.serverid).then(kvm => {
            if(kvm == 500) return reject({ message: "Der RootServer ist offline" });
            resolve({ message: "Der RootServer wird neugestartet" });
            RootServer.findByIdAndUpdate(rootserver._id, { upid: kvm.data.data }).then();
        });
      }).catch(error => {
        reject(error)
      })
    });
}

exports.extendRootServer = function(req) {
    return new Promise(function(resolve, reject) {
        if(req.body.duration == null) return reject();
        if(typeof req.body.duration == 'number') return reject();
        RootServer.findByIdAndUpdate(req.params.id, { $inc: { paidup: (86400000 * req.body.duration) } }).then();
        resolve({ message: "Der Server wurde erfolgreich verlängert" });
    });
}

exports.getRootServers = function(req) {
    return new Promise(async function(resolve, reject) {
        var kvm_status = [];
        var node_tasks = [];
        await new Promise((resolve, reject) => {
            Proxmox.getNodes().then(nodes => {
                var i = 0;
                nodes.forEach(node => {
                    i++;
                    Proxmox.listQemuVms(node.node).then(kvm_status_ => {
                        Proxmox.getNodeTasks(node.node).then(node_tasks_ => {
                            kvm_status = kvm_status.concat(kvm_status_);
                            node_tasks = node_tasks.concat(node_tasks_);
                            if(nodes.length == i) {
                                resolve();
                            }  
                        });
                    });  
                });
            });
        }); 
        var finalrootservers = [];
        RootServer.find().then(rootservers => {
            rootservers.forEach(rootserver => {
                var task = node_tasks.find(i =>{
                    if(i == null) return;
                    if(i.id == rootserver.serverid) {
                        if(i.status != 'OK' && i.type != 'vncproxy') {
                            if(!(i.endtime)) {
                                return i;
                            }
                        }
                    }
                });
                var status = kvm_status.find(i =>{
                    if(i == null) return;
                    if(i.vmid == rootserver.serverid) {
                        if(i.status != 'OK' && i.type != 'vncproxy') {
                            if(!(i.endtime)) {
                                return i;
                            }
                        }
                    }
                });
                if(task != undefined) {
                    switch(task.type) {
                        case 'qmcreate':
                            rootserver.status = 'Installation';
                            break;
                        case 'qmclone':
                            rootserver.status = 'Installation';
                            break;
                        case 'qmstart':
                            rootserver.status = 'Startet';
                            break;
                        case 'qmstop':
                            rootserver.status = 'Gestoppt';
                            break;
                        case 'qmshutdown':
                            rootserver.status = 'Heruntergefahren';
                            break
                        case 'qmreboot':
                            rootserver.status = 'Neustart';
                            break
                        default:
                            rootserver.status = 'Unbekannt'
                            console.log(task.type);
                            break;
                    }
                }
                if(status.status == 'running') {
                    rootserver.status = 'Online' 
                } else {
                    rootserver.status = 'Offline' 
                }
                rootserver.password = undefined;
                finalrootservers.push({rootserver, status})
            });
            resolve({rootservers: finalrootservers})
        });
    });
}


exports.getRootServersByUser = function(req) {
    return new Promise(async function(resolve, reject) {
        var kvm_status = [];
        var node_tasks = [];
        await new Promise((resolve, reject) => {
            Proxmox.getNodes().then(nodes => {
                var i = 0;
                nodes.forEach(node => {
                    i++;
                    Proxmox.listQemuVms(node.node).then(kvm_status_ => {
                        Proxmox.getNodeTasks(node.node).then(node_tasks_ => {
                            kvm_status = kvm_status.concat(kvm_status_);
                            node_tasks = node_tasks.concat(node_tasks_);
                            if(nodes.length == i) {
                                resolve();
                            }  
                        });
                    });  
                });
            });
        }); 
        var finalrootservers = [];
        RootServer.find({ userid: req.params.id }).then(rootservers => {
            rootservers.forEach(rootserver => {
                var task = node_tasks.find(i =>{
                    if(i == null) return;
                    if(i.id == rootserver.serverid) {
                        if(i.status != 'OK' && i.type != 'vncproxy') {
                            if(!(i.endtime)) {
                                return i;
                            }
                        }
                    }
                });
                var status = kvm_status.find(i =>{
                    if(i == null) return;
                    if(i.vmid == rootserver.serverid) {
                        if(i.status != 'OK' && i.type != 'vncproxy') {
                            if(!(i.endtime)) {
                                return i;
                            }
                        }
                    }
                });
                if(task != undefined) {
                    switch(task.type) {
                        case 'qmcreate':
                            rootserver.status = 'Installation';
                            break;
                        case 'qmclone':
                            rootserver.status = 'Installation';
                            break;
                        case 'qmstart':
                            rootserver.status = 'Startet';
                            break;
                        case 'qmstop':
                            rootserver.status = 'Gestoppt';
                            break;
                        case 'qmshutdown':
                            rootserver.status = 'Heruntergefahren';
                            break
                        case 'qmreboot':
                            rootserver.status = 'Neustart';
                            break
                        default:
                            rootserver.status = 'Unbekannt'
                            console.log(task.type);
                            break;
                    }
                }
                if(status.status == 'running') {
                    rootserver.status = 'Online' 
                } else {
                    rootserver.status = 'Offline' 
                }
                rootserver.password = undefined;
                finalrootservers.push({rootserver, status})
            });
            resolve({rootservers: finalrootservers})
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