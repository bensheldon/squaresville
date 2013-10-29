# Module dependencies.
sys = require("sys")
fs = require("fs")
yamlish = require("yamlish")
events = require("events")
eventEmitter = new events.EventEmitter()

express = require("express")
server = express.createServer()
io = require("socket.io").listen(server)

port = process.env.PORT || 4000
host = process.env.HOST || "localhost:4000"

config = require("./lib/config")

server.configure ->
  server.use express.methodOverride()
  server.use server.router
  server.set "view engine", "jade"
  server.set "view options",
    layout: false
  server.use express.static(__dirname + "/public")

# Use xhr-polling for Heroku... ugh
io.configure ->
  io.set "transports", ["xhr-polling"]
  io.set "polling duration", 10

io.sockets.on "connection", (socket) ->
  socket.emit "message", "test message"
  socket.on "rezone", (data) ->
    map.rezone(data.position, data.zone)

GameLoop = require('./lib/game_loop')
Map = require("./lib/models/map")
map = new Map(config['MAPSIZE'], io.sockets)
gameloop = new GameLoop(map)

map.squares[7][3].zone = "residential"
map.squares[8][3].zone = "road"
map.squares[9][3].zone = "residential"
map.squares[10][3].zone = "residential"
map.squares[7][4].zone = "residential"
map.squares[9][4].zone = "commercial"
map.squares[10][4].zone = "residential"
map.squares[8][4].zone = "road"
map.squares[8][5].zone = "road"
map.squares[8][6].zone = "road"
map.squares[8][7].zone = "road"
map.squares[8][8].zone = "road"
map.squares[6][8].zone = "industrial"
map.squares[7][8].zone = "industrial"
map.squares[6][9].zone = "industrial"
map.squares[7][9].zone = "industrial"
map.squares[8][9].zone = "road"
map.squares[15][15].zone = "residential"

# Routes
server.get "/", (req, res) ->
  res.render "index",
    title: "My Site"
    host: host
    port: port
    map: map

server.listen port
gameloop.start()
