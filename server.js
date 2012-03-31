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
map.squares[7][3].zone = 'residential';
map.squares[8][3].zone = 'road';
map.squares[9][3].zone = 'residential';
map.squares[10][3].zone = 'residential'
map.squares[7][4].zone = 'residential';
map.squares[9][4].zone = 'commercial';
map.squares[10][4].zone = 'residential'

map.squares[8][4].zone = 'road';
map.squares[8][5].zone = 'road';
map.squares[8][6].zone = 'road';
map.squares[8][7].zone = 'road';
map.squares[8][8].zone = 'road';
map.squares[6][8].zone = 'industrial';
map.squares[7][8].zone = 'industrial';
map.squares[6][9].zone = 'industrial';
map.squares[7][9].zone = 'industrial';
map.squares[8][9].zone = 'road';

map.squares[15][15].zone = 'residential'


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
  console.log('Population: ' + map.residents);
  
  // Update the map on every tick
  map.updateUiMap();
  
  var cycle = map.age % 3; 
  
  switch (cycle) {
    case 0:
      map.globalDemand();
      break;
	  case 1:
		  map.scanMap( function(square) {
		    square.doZone();
		  });
      break;
	  case 2:
		  map.scanMap( function(square) {
        if (square.zone ) {
		      square.doTransit();
        }
		  });
      break;
    
  }
  map.age++;
  setTimeout(loop, LOOPTIME); //restart
}
loop();
