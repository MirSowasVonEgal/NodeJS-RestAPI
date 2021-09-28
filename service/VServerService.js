require("dotenv").config();
var VServer = require('../model/VServer');
var Network = require('../model/Network');
var Product = require('../model/Product');
var User = require('../model/User');
var Invoice = require('../model/Invoice');
var AdminNetworkService = require('./admin/AdminNetworkService');
var SSHService = require('./SSHService');
var { Proxmox } = require('../core');

exports.orderVServer = function(req) {
    return new Promise(function(resolve, reject) {
      if(!req.body.os) return reject({ message: "Du musst ein OS angeben"});
      if(!req.body.duration) return reject({ message: "Du musst eine Dauer angeben"});
      Product.findById(req.params.id).then(product => {
        var duration = parseInt(JSON.stringify(req.body.duration).replace(/"/g, ''));
        var ipv4 = 1;
        if(req.body.ipv4)
            ipv4 = parseInt(JSON.stringify(req.body.ipv4).replace(/"/g, ''));
        var ipv6 = true;
        if(req.body.ipv6)
            ipv6 = parseInt(JSON.stringify(req.body.ipv4).replace(/"/g, ''));
        var price = ((((Number(product.price) + ipv4 - 1) / 30)));
        req.body.password = generatePassword(16);
        if(req.user.balance >= (price * duration).toFixed(2)) {
            User.findByIdAndUpdate(req.user._id, { balance: (req.user.balance - (duration * price)).toFixed(2) }).then();
            new Invoice({ product: 'VServer', user: req.user, userid: req.user._id, serviceid: product._id, method: 'Guthaben', amount: (duration * price).toFixed(2), status: 'Bezahlt', data: JSON.stringify(product) }).save()
            .then();
            Proxmox.getNodes().then(nodes => {
                var node = nodes[0].node;
                Proxmox.getNextVMID().then(nextid => {
                    var uuid = generateUUID();
                    AdminNetworkService.getIPAddresses(req, ipv6, "IPv6", nextid, uuid, "VServer").then(ipv6_network => {
                        AdminNetworkService.getIPAddresses(req, ipv4, "IPv4", nextid, uuid, "VServer").then(networks => {
                            params = {
                                vmid: nextid,
                                ostemplate: "local:vztmpl/" + req.body.os,
                                storage: 'local-lvm',
                                features: 'keyctl=1,nesting=1',
                                cores: Number(product.data.cores),
                                rootfs: Number(product.data.disk),
                                memory: Number(product.data.memory),
                                password: req.body.password,
                                unprivileged: 1,
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
                                    new VServer({ _id: uuid, serverid: nextid, userid: req.user._id, password: req.body.password, os: req.body.os, memory: Number(product.data.memory), 
                                        cores: Number(product.data.cores), disk: Number(product.data.disk), node: node, price: (price * 30), paidup: new Date().getTime() + (86400000 * duration), status: "Installation", upid: lxc.data.data }).save()
                                    .then(vserver => {
                                        if(vserver) {
                                            vserver.password = undefined;
                                            resolve({vserver, message: "Du hast dir erfolgreich einen VServer gemietet"})
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
    } else {
        return reject({ message: "Dein Guthaben reicht nicht aus" });
    }
    })
    });
}

exports.extendVServer = function(req) {
    return new Promise(function(resolve, reject) {
        if(req.body.duration == null) return reject();
        if(typeof req.body.duration == 'number') return reject();
        VServer.findById(req.params.id).then(vserver => {
            var price = ((vserver.price / 30) * req.body.duration).toFixed(2);
            if(req.user.balance >= price) {
                User.findByIdAndUpdate(req.user._id, { balance: (req.user.balance - price) }).then();
                VServer.findByIdAndUpdate(req.params.id, { $inc: { paidup: (86400000 * req.body.duration) } }).then();
                resolve({ message: "Der Server wurde erfolgreich verlängert" });
            } else {
                return reject({ message: "Du hast nicht genung Guthaben" });
            }
        })
    });
}

exports.getVServer = function(req) {
    return new Promise(function(resolve, reject) {
      VServer.findById(req.params.id).then(vserver => {
        if(vserver == null) return reject();
        if(vserver.userid != req.user._id) return reject();
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

exports.getVNC = function(req) {
    return new Promise(function(resolve, reject) {
      VServer.findById(req.params.id).then(async vserver => {
        if(vserver.userid != req.user._id) return reject();
        Proxmox.createAccessTicket({ password: Proxmox.ticket, username: req.user._id + "@pve" }).then(lxc => {
            resolve({ url: "https://" + process.env.PROXMOX_HOST + ":8006/?console=lxc&novnc=1&vmid=" + vserver.serverid + "&node=" + vserver.node + "&cmd=", CSRFPreventionToken: lxc.data.data.CSRFPreventionToken, cookie: "PVEAuthCookie=" + lxc.data.data.ticket });
        });
      }).catch(error => {
        reject(error)
      })
    });
}

exports.startVServer = function(req) {
    return new Promise(function(resolve, reject) {
      VServer.findById(req.params.id).then(vserver => {
        if(vserver.userid != req.user._id) return reject();
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
        if(vserver.userid != req.user._id) return reject();
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
        if(vserver.userid != req.user._id) return reject();
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
        if(vserver.userid != req.user._id) return reject();
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
        VServer.find({ userid: req.user._id }).then(vservers => {
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

function generatePassword(passwordLength) {
    var numberChars = "0123456789";
    var upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var lowerChars = "abcdefghijklmnopqrstuvwxyz";
    var allChars = numberChars + upperChars + lowerChars;
    var randPasswordArray = Array(passwordLength);
    randPasswordArray[0] = numberChars;
    randPasswordArray[1] = upperChars;
    randPasswordArray[2] = lowerChars;
    randPasswordArray = randPasswordArray.fill(allChars, 3);
    return shuffleArray(randPasswordArray.map(function(x) { return x[Math.floor(Math.random() * x.length)] })).join('');
  }
  
  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
}