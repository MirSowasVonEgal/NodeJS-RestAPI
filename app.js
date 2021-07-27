const package = require('./package.json');
var express = require('express');
var app = express();
var router = require("./router");
app.use(express.json());

// Config
require("dotenv").config();
const host = process.env.APP_HOST;
const port = process.env.APP_PORT;
const basePath = process.env.APP_BASEPATH;

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