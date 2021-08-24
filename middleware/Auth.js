require("dotenv").config();
var { JWT } = require('../core');
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
    req.user = decoded;
  } catch (err) {
    res.status(401);
    var response = { message: "Ungültiger Token" }
    Response.failed(response, req, res);
    return;
  }
  return next();
};

module.exports = verifyToken;