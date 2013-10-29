_ = require("underscore")

config = require("../config")

class Travel
  constructor: (map, start, destination) ->
    route = []
    adjacentSquares = map.adjacentSquaresCount(start, 2)

    # If no road whatsoever, then just fail entirely
    return false  if adjacentSquares["road"] is `undefined`

    # Let's go for a walk
    if adjacentSquares[destination] isnt `undefined`
      return (
        method: "walk"
        destination: adjacentSquares[destination][0] # just return the first one
        route: []
      )
    adjacentRoads = adjacentSquares["road"]

    # Now we'll try to drive
    while route.length < config['MAXDISTANCE']

      # Choose a random road from our available roads
      if route.length is 0

        # for our first drive, we can walk 2 squares from our start to find a road
        # which means we can recycle the earlier adjacentSquares; choose a random one
        driveOn = adjacentRoads[Math.floor(Math.random() * adjacentRoads.length)]
      else # (route.length > 0)
        adjacentSquares = map.adjacentSquaresCount(driveOn, 0) #get adjacent road squares
        return false  if adjacentSquares["road"] is `undefined` # nowhere else to go.
        adjacentRoads = adjacentSquares["road"]

        # remove any roads we've previously driven on
        # we have to map to JSON then map back to array to use the Underscore library
        adjacentRoads = _.map(adjacentRoads, (item) ->
          JSON.stringify item
        )
        route = _.map(route, (item) ->
          JSON.stringify item
        )
        adjacentRoads = _.difference(adjacentRoads, route)
        adjacentRoads = _.map(adjacentRoads, (item) ->
          JSON.parse item
        )
        route = _.map(route, (item) ->
          JSON.parse item
        )
        return false  if adjacentRoads.length is 0 # nowhere to drive we haven't driven before
        randRoadIndex = Math.floor(Math.random() * adjacentRoads.length)
        driveOn = adjacentRoads[randRoadIndex]
      route.push driveOn # make sure to add the road
      adjacentSquares = map.adjacentSquaresCount(driveOn, 2)
      if adjacentSquares[destination] isnt `undefined`
        return (
          method: "drive"
          destination: adjacentSquares[destination][0] # just return the first one
          route: route
        )
    false

module.exports = Travel
