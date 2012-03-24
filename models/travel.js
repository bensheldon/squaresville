var _ = require('underscore');
var MAXDISTANCE = 8;

var Travel = function (map, start, destination) {
	var route = [];
  var adjacentSquares = map.adjacentSquaresCount(start, 2);
  
  // If no road whatsoever, then just fail entirely
  if (adjacentSquares['road'] === undefined) {
    return false;
  }
  // Let's go for a walk
  if (adjacentSquares[destination] !== undefined) {
    return {
      method: 'walk',
      destination: adjacentSquares[destination][0], // just return the first one
      route: []
    }
  }
  
  var adjacentRoads = adjacentSquares['road'];
  // Now we'll try to drive
  while (route.length < MAXDISTANCE) {
    // Choose a random road from our available roads
    if (route.length == 0) {
      // for our first drive, we can walk 2 squares from our start to find a road
      // which means we can recycle the earlier adjacentSquares; choose a random one
      var driveOn = adjacentRoads[ Math.floor(Math.random() * adjacentRoads.length) ];
    }
    else { // (route.length > 0)
      var adjacentSquares = map.adjacentSquaresCount(driveOn, 0); //get adjacent road squares
      if (adjacentSquares['road'] === undefined) {
        return false; // nowhere else to go.
      }
      adjacentRoads = adjacentSquares['road'];
      
      // remove any roads we've previously driven on
      // we have to map to JSON then map back to array to use the Underscore library
      adjacentRoads = _.map(adjacentRoads, function(item){ return JSON.stringify(item); });
      route = _.map(route, function(item){ return JSON.stringify(item); });
      adjacentRoads = _.difference(adjacentRoads, route);
      adjacentRoads = _.map(adjacentRoads, function(item){ return JSON.parse(item); });
      route = _.map(route, function(item){ return JSON.parse(item); });
            
      if (adjacentRoads.length === 0) {
        return false; // nowhere to drive we haven't driven before
      }
      randRoadIndex = Math.floor(Math.random() * adjacentRoads.length);
      driveOn = adjacentRoads[ randRoadIndex ];      
    }
    route.push(driveOn); // make sure to add the road
    
    adjacentSquares = map.adjacentSquaresCount(driveOn, 2);
    if (adjacentSquares[destination] !== undefined) {
      return {
        method: 'drive',
        destination: adjacentSquares[destination][0], // just return the first one
        route: route
      }
    }
  }
  
  console.log(route);
  return false;
};

exports.Travel = Travel;