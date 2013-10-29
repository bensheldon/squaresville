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

MAPSIZE = 16
MAXDENSITY = 3
LOOPTIME = 1000

server.configure ->
  server.use express.methodOverride()
  server.use server.router
  server.set "view engine", "jade"
  server.set "view options",
    layout: false
  server.use express.static(__dirname + "/public")

server.listen port

# Use xhr-polling for Heroku... ugh
io.configure ->
  io.set "transports", ["xhr-polling"]
  io.set "polling duration", 10

io.sockets.on "connection", (socket) ->
  socket.emit "message", "test message"
  socket.on "rezone", (data) ->
    map.squares[data.position[0]][data.position[1]].rezone data.zone


Map = require("./models/map")
map = new Map(MAPSIZE, io.sockets)

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

###
# Game Loop
###
loop_ = ->
  console.log "Age: " + map.age
  console.log "Population: " + map.residents
  
  # Update the map on every tick
  map.updateUiMap()
  cycle = map.age % 3
  switch cycle
    when 0
      map.globalDemand()
    when 1
      map.scanMap (square) ->
        square.doZone()
    when 2
      map.scanMap (square) ->
        square.doTransit() if square.zone

  map.age++
  setTimeout loop_, LOOPTIME #restart

loop_()