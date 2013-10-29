config = require("./config")

class GameLoop
  constructor: (@map) ->

  start: ->
    @loop()

  loop: =>
    console.log "Age: #{@map.age}"
    console.log "Population: #{@map.residents}"

    # Update the map on every tick
    @map.updateUiMap()

    switch  @map.age % 3
      when 0
        @map.globalDemand()
      when 1
        @map.scanMap (square) ->
          square.doZone()
      when 2
        @map.scanMap (square) ->
          square.doTransit() if square.zone
    @map.age++

    setTimeout @loop, config['LOOPTIME'] #restart

module.exports = GameLoop
