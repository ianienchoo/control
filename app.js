// require
var path           = require('path');
var express        = require('express');
var logger         = require('morgan');
var app            = express();
var sphero         = require("sphero");
var ORB_COLOR      = "cyan";
var robot          = require("robotjs");

// to connect to bb8, run:
// node ./node_modules/noble/examples/advertisement-discovery.js

var orb = sphero("efb43c0cd4c54a9eafe8a2e35199188e");
var isTapped = false;

orb.connect(function() {
  // keep alive
  setInterval(function(){
    orb.ping();
  }, 30000);

  // auto-reconnect: http://sdk.sphero.com/community-apis/javascript-sdk/
  orb.setAutoReconnect(1, 20, function(err, data) {
    console.log(err || "data: " + data);
  });

  // turn Sphero color
  orb.color(ORB_COLOR);

  // have Sphero tell you when it detect collisions
  orb.detectCollisions({device:"bb8"});

  // when Sphero detects a collision, turn red for a second, then back to green
  orb.on("collision", function(data) {
    orb.color("white");

    if (!isTapped) {
      isTapped = true;
      robot.keyTap("z");
      setTimeout(function(){
        isTapped = false;
      },100);
    }

    setTimeout(function() {
      orb.color(ORB_COLOR);
    }, 200);

  });
});

// middleware
app.use(logger('dev'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler - will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler - no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// start
app.listen(3000);
console.log('Server has Awakened...');
