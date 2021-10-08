require("dotenv").config();
const { container_v1beta1 } = require("googleapis");
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


exports.resetPassword = function(serverid, password) {
    ssh.connect({
        host: process.env.PROXMOX_HOST,
        username: 'root',
        port: 22,
        password: process.env.PROXMOX_PASSWORD
    }).then(() => {
        ssh.execCommand("screen -AmdS ResetPassword_CT" + serverid + " pct exec " + serverid + " -- bash -c 'echo root:" + password.replace(/'/g, "").replace(/`/g, "").replace(/"/g, "") + " | chpasswd'");
    });
}


getDockerContainerLogs = function(serverid, name) {
    return new Promise((resolve, reject) => {
        ssh.connect({
            host: process.env.PROXMOX_HOST,
            username: 'root',
            port: 22,
            password: process.env.PROXMOX_PASSWORD
        }).then(async () => {
            ssh.execCommand(`pct exec ` + serverid + ` -- bash -c 'docker logs --tail 150 ` + name.replace(/'/g, "").replace(/`/g, "").replace(/"/g, "") + `'`).then(output => {
                resolve({ logs: output.stdout });
            });
        });
    });
}


startDockerContainer = function(serverid, name) {
    ssh.connect({
        host: process.env.PROXMOX_HOST,
        username: 'root',
        port: 22,
        password: process.env.PROXMOX_PASSWORD
    }).then(async () => {
        ssh.execCommand(`pct exec ` + serverid + ` -- bash -c 'curl --unix-socket /var/run/docker.sock http://localhost/containers/json?all=1'`).then(output => {
            var containers = JSON.parse(output.stdout.toLowerCase());
            containers.forEach(container => {
                container.name = container.names[0].replace("/", "");
            });
            resolve(containers);
        });
    });
}

startDockerContainer = function(serverid, name) {
    ssh.connect({
        host: process.env.PROXMOX_HOST,
        username: 'root',
        port: 22,
        password: process.env.PROXMOX_PASSWORD
    }).then(async () => {
        ssh.execCommand(`pct exec ` + serverid + ` -- bash -c 'docker start ` + name.replace(/'/g, "").replace(/`/g, "").replace(/"/g, "") + `'`);
    });
}

stopDockerContainer = function(serverid, name) {
    ssh.connect({
        host: process.env.PROXMOX_HOST,
        username: 'root',
        port: 22,
        password: process.env.PROXMOX_PASSWORD
    }).then(async () => {
        ssh.execCommand(`pct exec ` + serverid + ` -- bash -c 'docker stop ` + name.replace(/'/g, "").replace(/`/g, "").replace(/"/g, "") + `'`);
    });
}

createMCDockerContainer = function(serverid, params) {
    ssh.connect({
        host: process.env.PROXMOX_HOST,
        username: 'root',
        port: 22,
        password: process.env.PROXMOX_PASSWORD
    }).then(async () => {
        ssh.execCommand(`pct exec ` + serverid + ` -- bash -c 'docker run --name mp8 -d -it -p 25555:25565 -v /docker/mp8:/data -e EULA=TRUE -e TYPE=CURSEFORGE -e CF_SERVER_MOD=https://www.curseforge.com/minecraft/modpacks/better-minecraft-modpack/download/3477079/file -e MEMORY=4G itzg/minecraft-server:java8-openj9'`);
        //ssh.execCommand(`pct exec ` + serverid + ` -- bash -c 'docker run --name ` + params.name + ` -d -it -p ` + params.port + `:25565 -v ` + params.folder + `:/data -e EULA=TRUE -e TYPE=` + params.type + ` -e MEMORY=` + params.memory + `G -e VERSION=` + params.version + ` itzg/minecraft-server:latest'`);
    });
}

runMCCommandDockerContainer = function(serverid, name, command) {
    ssh.connect({
        host: process.env.PROXMOX_HOST,
        username: 'root',
        port: 22,
        password: process.env.PROXMOX_PASSWORD
    }).then(async () => {
        ssh.execCommand(`pct exec ` + serverid + ` -- bash -c 'docker exec ` + name.replace(/'/g, "").replace(/`/g, "").replace(/"/g, "") + ` rcon-cli ` + command.replace(/'/g, "").replace(/`/g, "").replace(/"/g, "") + `'`);
    });
}

//createMCDockerContainer(159, '')
runMCCommandDockerContainer('159', 'mp7', 'op MirSowasVonEgal')
