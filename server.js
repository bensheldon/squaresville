// Module dependencies.
var sys           = require('sys')
  , fs            = require('fs')
  , yamlish       = require('yamlish')
  , events        = require('events')
  , eventEmitter  = new events.EventEmitter()
  , express       = require('express')
  , server        = express.createServer()
  , io            = require('socket.io').listen(server)
  , port          = 4000;

var MAPSIZE = 16;
var MAXDENSITY = 3;
var LOOPTIME = 1000;
var mapAge = 0;

  server.configure(function(){
    server.use(express.methodOverride());
    server.use(server.router);
    server.set('view engine', 'jade');
    server.set('view options', { layout: false });
    server.use(express.static(__dirname + '/public'));
  });
  
  server.listen(port);
  
  // Routes
  server.get('/', function(req, res) {
    res.render('index', { 
      title: 'My Site',
      map: {
        mapsize: MAPSIZE
      }
    });
  });
  
  io.sockets.on('connection', function (socket) {
    socket.emit('message', 'test message');
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });