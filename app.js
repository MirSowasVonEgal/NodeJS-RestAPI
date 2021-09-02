const package = require('./package.json');
var express = require('express');
var app = express();
var router = require("./router");
var GlobalLogs = require('./model/GlobalLogs');
var Ticket = require('./model/Ticket');
var mongoose = require('mongoose');
app.use(express.json());

require("dotenv").config();

mongoose.connect(`mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`, 
{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false  });

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
            var ticketdate = Number(JSON.stringify(ticket.created).replace(/"/g, '')) + (12 * 60 * 60 * 1000);
            if(date > ticketdate) {
              Ticket.findByIdAndUpdate(ticket._id, { closed: true }).then();
            }
          });
      });
      hourSchedular();
  }, 60 * 1000);
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