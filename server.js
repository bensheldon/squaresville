// Module dependencies.
var sys           = require('sys')
  , fs            = require('fs')
  , yamlish       = require('yamlish')
  , events        = require('events')
  , eventEmitter  = new events.EventEmitter()
  , express       = require('express')
  , server        = express.createServer()
  , io            = require('socket.io').listen(server)
  , port          = process.env.PORT || 4000
  , host          = process.env.HOST || 'localhost:4000';
  


var MAPSIZE = 16;
var MAXDENSITY = 3;
var LOOPTIME = 1000;

server.configure(function(){
  server.use(express.methodOverride());
  server.use(server.router);
  server.set('view engine', 'jade');
  server.set('view options', { layout: false });
  server.use(express.static(__dirname + '/public'));
});

server.listen(port);

// Use xhr-polling for Heroku... ugh
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.sockets.on('connection', function (socket) {
  socket.emit('message', 'test message');
  socket.on('rezone', function (data) {
    map.squares[data.position[0]][data.position[1]].rezone(data.zone);
  });
});

var Map = require('./models/map').Map;
var map = new Map(MAPSIZE, io.sockets);


// Routes
server.get('/', function(req, res) {
  res.render('index', { 
    title: 'My Site',
    host: host,
    port: port,
    map: map
  });
});


/**
 * Game Loop
 */
var loop = function() {
  console.log('Age: ' + map.age);
  console.log('Population: ' + map.population);
  map.updateUiMap();
  map.scanMap( function(square) { 
    square.calcPopulation();
    //square.calcMaxDensity();
  });

  map.age++;
  setTimeout(loop, LOOPTIME); //restart
}
loop();
