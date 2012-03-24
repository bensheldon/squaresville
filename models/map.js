var Square = require('./square.js').Square
	, _ = require('underscore');

var Map = function(mapsize, emitter) {
  this.age = 0;
  this.emitter = emitter;
  this.mapsize = mapsize;
  this.residents = 0;
  this.jobs = 0;
  this.demand = {
    residential: 1,
    commercial: 1,
    industrial: 1
  };
      
  // Setup our squares
  this.squares = [mapsize];
  for(var x=0; x < this.mapsize; x++) {
    var column = [this.mapsize];
    for(var y=0; y < this.mapsize; y++) {
      column[y] = new Square(this, [x,y]);
    }
    this.squares[x] = column;
  }
};

/**
 * Scan through all squares in the map and
 * call the callback function on each square
 */
Map.prototype.scanMap = function(callback) {
  for(var y=0; y < this.mapsize; y++) {
    for(var x=0; x < this.mapsize; x++) {
      callback(this.squares[x][y]);
    }
  }
};

/**
 * Returns a list of positions of squares adjacent to the input position
 */
Map.prototype.adjacentSquares = function(position, distance) {
  var squarePositions = [];
  
  if (distance === 0) {
		if(position[1] - 1 > 0) { // North
			squarePositions.push([position[0],position[1]-1]);
		}
		if (position[0] + 1 < this.mapsize) { // East
			squarePositions.push([position[0]+1, position[1]]);
		}
		if (position[1] + 1 < this.mapsize) { // South
			squarePositions.push([position[0], position[1]+1]);
		}
		if (position[0] - 1 > 0) { // West
			squarePositions.push([position[0] -1 , position[1]]);
		}
	}
	else { // distance > 0  
	  // Starting in the North-West corner, scan adjacent squares
	  for (var y = position[1] - distance; y <= position[1] + distance; y++) {
	    if ( (y >= 0) && (y < this.mapsize)) { // not beyond border of map
	      for (var x = position[0] - distance; x <= position[0] + distance; x++) {
	        if ( (x >= 0) && (x < this.mapsize) ) { // not beyond border of map
	          if ( (x !== position[0]) || (y !== position[1]) ) { // not the square itself
	            squarePositions.push([x,y]);
	          }
	        }
	      }
	    }
	  }
	}
  return squarePositions;
};

Map.prototype.adjacentSquaresCount = function (position, distance) {
  var count = {};
  
  // get the adjacent squares and iterate
  var adjacentSquares = this.adjacentSquares(position, distance);
  for (var i = 0; i < adjacentSquares.length; i++) {
    var position = adjacentSquares[i];
    var square = this.squares[position[0]][position[1]];
    if (count[square.zone] === undefined) {
			count[square.zone] = [square.position];
		}
		else {
			count[square.zone].push(square.position);
		}
  }
  return count;
};

Map.prototype.updateUiMap = function() {
  var data = {
    map: {
      age: this.age,
      residents: this.residents,
      jobs: this.jobs,
      demand: this.demand
    }
  }
  this.emitter.emit('updateMap', data);
};

Map.prototype.updateUiSquare = function(square) {
  var data = {
    square: {
      position: square.position,
      zone: square.zone,
      residents: square.residents,
      jobs: square.jobs,
      pollution: square.pollution
    }
  }
  this.emitter.emit('updateSquare', data);
};

exports.Map = Map;