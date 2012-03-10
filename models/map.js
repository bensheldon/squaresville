var Square = require('./square.js').Square;

var Map = function(mapsize, emitter) {
  this.age = 0;
  this.emitter = emitter;
  this.mapsize = mapsize;
  this.population = 0;
  this.countZones = {
    residential: 0,
    commercial: 0,
    industrial: 0
  };
  this.demand = {
    residential: 1,
    commercial: 1,
    industrial: 1
  }
  
  // Setup our squares
  this.squares = [mapsize];
  for(var x=0; x < this.mapsize; x++) {
    var column = [this.mapsize];
    for(var y=0; y < this.mapsize; y++) {
      column[y] = new Square(this, [x,y], null);
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

Map.prototype.updateUiMap = function() {
  var data = {
    map: {
      age: this.age,
      population: this.population
    }
  }
  this.emitter.emit('updateMap', data);
};

Map.prototype.updateUiSquare = function(square) {
  var data = {
    square: {
      position: square.position,
      zone: square.zone,
      density: square.density
    }
  }
  this.emitter.emit('updateSquare', data);
};

exports.Map = Map;