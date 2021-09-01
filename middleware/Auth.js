require("dotenv").config();
var { JWT } = require('../core');
var User = require('../model/User');
var Roles = require('../model/Roles');
var Response = require('../core/Response');

const verifyToken = (req, res, next) => {
    if(req.headers.authorization)
        var token = req.headers.authorization.split(' ')[1];

  if (!token) {
    res.status(401);
    var response = { message: "A token is required for authentication" }
    Response.failed(response, req, res);
    return;
  }
  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    if(decoded.confirm) {
      var response = { message: "Ungültiger Token" }
      Response.failed(response, req, res);
      return;
    }
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
    if(decoded.ip != ip) {
      var response = { message: "Ungültiger Token" }
      Response.failed(response, req, res);
      return;
    }
    req.user = decoded;
  } catch (err) {
    res.status(401);
    var response = { message: "Ungültiger Token" }
    Response.failed(response, req, res);
    return;
  }

  User.findOne({ _id: req.user.uuid })
  .then(result => {
      user = JSON.parse(JSON.stringify(result));

      user.password = undefined;
      user.role = req.role;
    
      Roles.findOne({ name: result.role }).then(role => {
        if(role) {
          user.role = role;
        } else { 
          user.role = {
            name: "Customer",
            fullname: "Customer",
            color: "#00ccff",
            permissions: []
          }
        }
        
        req.user = user;

        if(user.blocked == true) {
          Response.failed("", req, res);
        } else {
          return next();
        }
      });
  })
  .catch(error => Response.failed({ message: error }, req, res));

  // Permission Abfrage
  //  if((req.user.role.permissions.find(i => i == permission)) || req.user.role.permissions.find(i => i == '*'))

};

var roles = [
  {
      name: "CEO",
      fullname: "Chief Executive Officer",
      color: "#cc0000",
      permissions: [ "*" ]
  },
  {
      name: "FLS",
      fullname: "First Level Supporter",
      color: "#009933",
      permissions: [ "support.tickets" ]
  },
  {
      name: "Customer",
      fullname: "Customer",
      color: "#00ccff",
      permissions: []
  }
]

module.exports = verifyToken;