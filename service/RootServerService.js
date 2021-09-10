require("dotenv").config();
var RootServer = require('../model/RootServer');
var Network = require('../model/Network');
var OS = require('../model/OS');
var Product = require('../model/Product');
var User = require('../model/User');
var AdminNetworkService = require('./admin/AdminNetworkService');
var { Proxmox } = require('../core');

exports.orderRootServer = function(req) {
    return new Promise(function(resolve, reject) {
      if(!req.body.os) return reject({ message: "Du musst ein OS angeben"});
      if(!req.body.duration) return reject({ message: "Du musst eine Dauer angeben"});
      Product.findById(req.params.id).then(product => {
        if(product.type != "RootServer") return reject();
        var duration = parseInt(JSON.stringify(req.body.duration).replace(/"/g, ''));
        var ipv4s = 1;
        if(req.body.ipv4s)
            ipv4s = parseInt(JSON.stringify(req.body.ipv4s).replace(/"/g, ''));
        var ipv6 = true;
        if(req.body.ipv6)
            ipv6 = parseInt(JSON.stringify(req.body.ipv4s).replace(/"/g, ''));
        var price = ((((product.price + ipv4s- 1) / 30)));
        password = generatePassword(16);
        if(req.user.balance >= (price * duration).toFixed(2)) {
            User.findByIdAndUpdate(req.user._id, { $inc : { 'balance': (duration * price * (-1)).toFixed(2) } }).then();
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
                                    params.cores = product.data.cores;
                                    params.memory = product.data.memory;
                                    params.cipassword = password;
                                    ipv6 = false;
                                    i++;
                                });
                                Proxmox.cloneQemuVm(node, server_os.number, { newid: nextid, name: "VM" + nextid }).then(qemu => {
                                    if(qemu.status == 200) {
                                        new RootServer({ _id: uuid, serverid: nextid, userid: req.user._id, password: password, os: req.body.os, memory: product.data.memory, 
                                            cores: product.data.cores, disk: product.data.disk, node: node, price: product.price, paidup: new Date().getTime() + (86400000 * duration), status: "Installation", upid: qemu.data.data }).save()
                                        .then(rootserver => {
                                            if(rootserver) {
                                                rootserver.password = undefined;
                                                resolve({rootserver, networks, ipv6_network, message: "Der Server wurde erstellt"})
                                                Proxmox.putAccessAcl({ path: "/vms/"+ rootserver.serverid, roles: "VNC", users: req.user._id + "@pve" });
                                                setTimeout(function(){
                                                    Proxmox.setQemuVmConfig(rootserver.node, rootserver.serverid, params);
                                                    Proxmox.resizeQemuVm(rootserver.node, rootserver.serverid, { disk: 'scsi0', size: '+' + (product.data.disk-10) + 'G'  });
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
    } else {
        return reject({ message: "Dein Guthaben reicht nicht aus" });
    }
    })
    });
}

exports.getVNC = function(req) {
    return new Promise(function(resolve, reject) {
        rootserver.findById(req.params.id).then(rootserver => {
        if(rootserver.userid != req.user._id) return reject();
        Proxmox.createAccessTicket({ password: Proxmox.ticket, username: req.user._id + "@pve" }).then(kvm => {
            resolve({ url: "https://" + process.env.PROXMOX_HOST + ":8006/?console=kvm&xtermjs=1&vmid=" + rootserver.serverid + "&node=" + rootserver.node + "&cmd=", CSRFPreventionToken: kvm.data.data.CSRFPreventionToken, cookie: "PVEAuthCookie=" + kvm.data.data.ticket });
        });
      }).catch(error => {
        reject(error)
      })
    });
}

exports.getRootServer = function(req) {
    return new Promise(function(resolve, reject) {
      RootServer.findById(req.params.id).then(rootserver => {
        if(rootserver.userid != req.user._id) return reject();
        Network.find({ serveruuid: req.params.id }).then(networks => {
            Proxmox.getQemuVmConfig(rootserver.node, rootserver.serverid).then(config => {
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
                        if(!config.ipconfig0) {
                            rootserver.status = 'Installation';
                        }
                        resolve({rootserver, networks, status});
                    
                    });
                } else {
                    if(status.status == 'running') {
                        rootserver.status = 'Online' 
                    } else {
                        rootserver.status = 'Offline' 
                    }
                    if(!config.ipconfig0) {
                        rootserver.status = 'Installation';
                    }
                    resolve({rootserver, status});
                }
            })
        }).catch(error => {
            reject(error)
        })
    })
    })
    });
}

exports.startRootServer = function(req) {
    return new Promise(function(resolve, reject) {
      RootServer.findById(req.params.id).then(rootserver => {
        if(rootserver.userid != req.user._id) return reject();
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
        if(rootserver.userid != req.user._id) return reject();
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
        if(rootserver.userid != req.user._id) return reject();
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
        if(rootserver.userid != req.user._id) return reject();
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
        RootServer.find({ userid: req.user._id }).then(async rootservers => {
            await new Promise(async (resolve, reject) => {
                await rootservers.forEachAsyncParallel(async rootserver => {
                var config = await Proxmox.getQemuVmConfig(rootserver.node, rootserver.serverid);
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
                    if(!await config.ipconfig0) {
                        rootserver.status = 'Installation';
                    }
                }
                if(status.status == 'running') {
                    rootserver.status = 'Online' 
                } else {
                    rootserver.status = 'Offline' 
                }
                if(!await config.ipconfig0) {
                    rootserver.status = 'Installation';
                }
                rootserver.password = undefined;
                finalrootservers.push({rootserver, status})
            }); 
            resolve()
        });
        resolve({rootservers: finalrootservers})
        });
    });
}

Array.prototype.forEachAsyncParallel = async function (fn) {
    await Promise.all(this.map(fn));
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