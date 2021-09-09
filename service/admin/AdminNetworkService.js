require("dotenv").config();
var Network = require('../../model/Network');

exports.addIPAddresses = function(req) {
    return new Promise(function(resolve, reject) {
      if(!req.body.type) return reject({ message: "Du musst einen Typen angeben (IPv4/IPv6)"});
      if(!req.body.ip) return reject({ message: "Du musst eine IP angeben"});
      if(!req.body.subnet) return reject({ message: "Du musst Subnet Maske angeben"});
      if(req.body.type == 'IPv4') {
        if(req.body.ip.includes("-")) {
            Network.find().then(networks_ => {
                var ips = req.body.ip.split("-");
                var firstip = ips[0].split('.');
                var secondip = ips[1].split('.');
                var start =  firstip[3];
                var end =  secondip[3];
                var default_structure = firstip[0] + "." +  firstip[1]  + "." + firstip[2] + ".";
                console.log(default_structure)
                var max = true;
                var ips = [];
                for (var i = 0; i < 255; i++) {
                    var ip = (default_structure + (Number(start) + Number(i)));
                    if(!networks_.find(i => i.ip == ip)) {
                        var ip = (default_structure + (Number(start) + Number(i)));
                        ips.push({ 
                            ip: (default_structure + (Number(start) + Number(i))),
                            gateway: req.body.gateway,
                            subnet: req.body.subnet,
                            type: req.body.type});
                    }
                    if((Number(start) + Number(i)) == Number(end)) {
                        max = false;
                        break;
                    }
                }
                if(max == true) {
                    return reject({ message: "Die reichweite der IPs war ungültig" })
                }
                Network.create(ips).then(networks => resolve({networks}));
            });
        } else {
            Network.find({ ip: req.body.ip }).then(result => {
                if(!result) {
                    Network({ type: req.body.type, gateway: req.body.gateway, ip: req.body.ip, subnet: req.body.subnet, macaddress: req.body.macaddress }).save().then(network => {
                        resolve({network});
                    });
                } else {
                    reject()
                }
            })
        }
      } else {
        Network.findOne({ ip: req.body.ip }).then(result => {
            if(!result) {
                Network({ type: req.body.type, gateway: req.body.gateway, ip: req.body.ip, subnet: req.body.subnet, macaddress: req.body.macaddress }).save().then(network => {
                    resolve({network});
                });
            } else {
                reject()
            }
        })
      }
    });
}


exports.getIPAddresses = function(req, amount, type, serverid, serveruuid, servertype) {
    return new Promise(function(resolve, reject) {
        if(type == 'IPv4') {
            Network.find({ serverid: null, type: type, }).limit(amount).then(networks => {
                resolve(networks)
                networks.forEach(network => {
                    network.serverid = serverid;
                    network.serveruuid = serveruuid;
                    network.servertype = servertype;
                    network.userid = req.user._id;
                    Network.findByIdAndUpdate(network._id, network).then();
                });
            })
        } else {
            if(amount) {
                Network.findOne({ type: "IPv6_SUBNET" }).limit(amount).then(ipv6_subnet => {
                    if(ipv6_subnet.subnet == "48") {
                        var i = (ipv6_subnet.ip + "").length - 1;
                        var default_structure = ipv6_subnet.ip.substring(0, i);
                        var ip = default_structure + serverid + "::";
                        Network({ type: "IPv6", subnet: "64", ip: ip, serverid, serveruuid, servertype, userid: req.user._id }).save().then(network => {
                            resolve(network)
                        }).catch(error => console.log(error));
                    } else if(ipv6_subnet.subnet == "64") {
                        var i = (ipv6_subnet.ip + "").length - 1;
                        var default_structure = ipv6_subnet.ip.substring(0, i);
                        var ip = default_structure + serverid + "::";
                        Network({ type: "IPv6", subnet: "80", ip: ip, serverid, serveruuid, servertype, userid: req.user._id }).save().then(network => {
                            resolve(network)
                        }).catch(error => console.log(error));
                    } else if(ipv6_subnet.subnet == "80") {
                        var i = (ipv6_subnet.ip + "").length - 1;
                        var default_structure = ipv6_subnet.ip.substring(0, i);
                        var ip = default_structure + serverid + "::";
                        Network({ type: "IPv6", subnet: "96", ip: ip, serverid, serveruuid, servertype, userid: req.user._id }).save().then(network => {
                            resolve(network)
                        }).catch(error => console.log(error));
                    }
                });
            }
        }
    });
}