const package = require('./package.json');
var express = require('express');
var app = express();
var router = require("./router");
var GlobalLogs = require('./model/GlobalLogs');
var Ticket = require('./model/Ticket');
var VServer = require('./model/VServer');
var RootServer = require('./model/RootServer');
var Network = require('./model/Network');
var mongoose = require('mongoose');
var cors = require('cors')

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:8080']
}));

require("dotenv").config();

var mongoose = require('mongoose');
const { Proxmox } = require('./core');

var isConnectedBefore = false;
var connect = function() {
  mongoose.connect(`mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`, 
  {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false, auto_reconnect: true });
};

connect();

mongoose.connection.on('disconnected', function(){
    console.log('Lost MongoDB connection...');
    if (!isConnectedBefore)
        connect();
});
mongoose.connection.on('connected', function() {
    isConnectedBefore = true;
    console.log('MongoDB connected ...');
});

var globallogs = [];

mongoose.set("debug", (collectionname, method, query, doc) => {
  if(collectionname == 'globallogs' || method == 'createIndex') return;
  query = JSON.stringify(query);
  doc = JSON.stringify(doc);
  globallogs.push({ collectionname, method, query, doc });
});



minuteSchedular();
function minuteSchedular() {
  setTimeout(function () {
      if(globallogs != [])
        GlobalLogs.insertMany(globallogs).then();
      globallogs = [];
      minuteSchedular();
  }, 60 * 1000);
}

hourSchedular();
function hourSchedular() {
  setTimeout(function () {
        Ticket.find({ status: "Beantwortet", closed: false }).then(tickets => {
          tickets.forEach(ticket => {
            var date = new Date().getTime();
            var ticketdate = Number(JSON.stringify(ticket.lastupdate).replace(/"/g, '')) + (12 * 60 * 60 * 1000);
            if(date > ticketdate) {
              Ticket.findByIdAndUpdate(ticket._id, { closed: true }).then();
            }
        });
        VServer.find({ paidup: { $lte: new Date().getTime() } }).then(vservers => {
          vserver_filtered = vservers.filter(i => i.paidup !== -1)
          vserver_filtered.forEach(vserver => {
            if(parseInt(vserver.paidup + (86400000*7)) > parseInt(new Date().getTime())) {
              Proxmox.stopLxcContainer(vserver.node, vserver.serverid).then();
              VServer.findByIdAndUpdate(vserver._id, { blocked: true }).then();
            } else {
              VServer.findByIdAndDelete(vserver._id).then();
              Network.deleteMany({ serverid: vserver._id, type: 'IPv6'});
              Network.updateMany({ serverid: vserver._id, type: 'IPv4'}, { serverid: null, serveruuid: null, servertype: null });
              Proxmox.deleteLxcContainer(vserver.node, vserver.serverid).then();
            }
          });
        });
        RootServer.find({ paidup: { $lte: new Date().getTime() } }).then(rootservers => {
          rootserver_filtered = rootservers.filter(i => i.paidup !== -1)
          rootserver_filtered.forEach(rootserver => {
            if(parseInt(rootserver.paidup + (86400000*7)) > parseInt(new Date().getTime())) {
              Proxmox.stopQemuVm(rootserver.node, rootserver.serverid).then();
              RootServer.findByIdAndUpdate(rootserver._id, { blocked: true }).then();
            } else {
              RootServer.findByIdAndDelete(rootserver._id).then();
              Network.deleteMany({ serverid: rootserver._id, type: 'IPv6'});
              Network.updateMany({ serverid: rootserver._id, type: 'IPv4'}, { serverid: null, serveruuid: null, servertype: null });
              Proxmox.deleteQemuVm(rootserver.node, rootserver.serverid).then();
            }
          });
        });
      });
      hourSchedular();
  }, 60 * 60 * 1000);
}

process.on('exit', function() {
  if(globallogs != [])
    GlobalLogs.insertMany(globallogs).then();
});

//mongoose.connect(`mongodb+srv://admin:G5WY7wZ2U6Z7tifV@cluster0.ihqwe.mongodb.net/RestAPI?retryWrites=true&w=majority`, 
//{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });

// Config
const host = process.env.APP_HOST;
const port = process.env.APP_PORT;
const basePath = process.env.APP_BASEPATH;

// Static
app.use('/static', express.static('static'));

// Enable CORS on ExpressJS to avoid cross-origin errors when calling this server using AJAX
// We are authorizing all domains to be able to manage information via AJAX (this is just for development)
app.use((req, res, next) => {
  res.header('Content-Type', 'application/json');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,recording-session");
  res.status(-1);
  next();
});

//Route Prefixes
app.use("/" + basePath, router);

app.get('/', function(req, res) {
  res.status(200);
  res.json({ online: true, version: package.version, name: package.name, author: package.author });
});

app.all('*', function(req, res) {
  res.status(404);
  
  res.json({ error: true, response: { message: "Error 404. Page not found!"}});
});

app.listen(port, host, () => {
  console.log(`Die RestAPI läuft auf der URL: http://${host}:${port}`)
})