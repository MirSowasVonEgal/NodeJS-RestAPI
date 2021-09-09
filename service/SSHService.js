require("dotenv").config();
const {NodeSSH} = require('node-ssh')

const ssh = new NodeSSH()

exports.updateAndAllowRoot = function(serverid) {
    ssh.connect({
        host: process.env.PROXMOX_HOST,
        username: 'root',
        port: 22,
        password: process.env.PROXMOX_PASSWORD
    }).then(() => {
        ssh.execCommand("screen -AmdS AllowRootLogin_CT" + serverid + " pct exec " + serverid + " -- bash -c 'echo \"PermitRootLogin yes\" >> /etc/ssh/sshd_config && service sshd restart'");
        ssh.execCommand("screen -AmdS Update_CT" + serverid + " pct exec " + serverid + " -- bash -c 'apt update -y && apt upgrade -y && apt full-upgrade -y && apt autoremove -y && apt clean -y'");
    });
}

exports.updateServer = function(serverid) {
    ssh.connect({
        host: process.env.PROXMOX_HOST,
        username: 'root',
        port: 22,
        password: process.env.PROXMOX_PASSWORD
    }).then(() => {
        ssh.execCommand("screen -AmdS Update_CT" + serverid + " pct exec " + serverid + " -- bash -c 'apt update -y && apt upgrade -y && apt full-upgrade -y && apt autoremove -y && apt clean -y'");
    });
}
