var MAPSIZE = 8;
var MAXDENSITY = 3;
var LOOPTIME = 1000;
var ZONETYPES = {};
var mapAge = 0;


var Square = function(map, position, zone) {
  this.population = 0;
  this.zone = null;
  this.maxDensity = 0;
  this.position = [position[0], position[1]];
  this._map = map; // reference the parent map (not sure if this is correct
};

Square.prototype.rezone = function(zone) {
  this.zone = zone;
  this.population = 0;
  this._map.updateUI(this, 'zone', zone);
};

Square.prototype.calcMaxDensity = function() {
  switch(this.zone) {
    case 'residential':
      if (this.calcMaxDensityResidential()) {
        this._map.updateUI(this, 'density', this.maxDensity);
      }
      break;
    case 'commercial':
      break;
  }
};

Square.prototype.calcMaxDensityResidential = function() {
  var adjacentCount = this.adjacentSquaresCount(1);
  
  switch(this.maxDensity) {
    case 0:
      // should be demand based to go up, but oh well
      this.maxDensity = 1;
      return true;
    case 1:
      if (adjacentCount.residential > 6) {
        this.maxDensity = 2;
        return true;
      }
      break;
    case 2:
      if (adjacentCount > 8) {
        this.maxDensity = 2;
        return true;
      }
      break;
    case 3:
      break; // no more growth
  }
};

/**
 * Returns a list of positions of squares adjacent to the input position
 */
Square.prototype.adjacentSquares = function(distance) {
  var squarePositions = [];
  
  // Starting in the North-West corner, scan adjacent squares
  for (var y = this.position[1] - distance; y <= this.position[1] + distance; y++) {
    if ( (y >= 0) && (y < this._map.mapsize)) { // not beyond border of map
      for (var x = this.position[0] - distance; x <= this.position[0] + distance; x++) {
        if ( (x >= 0) && (x < this._map.mapsize) ) { // not beyond border of map
          if ( (x !== this.position[0]) || (y !== this.position[1]) ) { // not the square itself
            squarePositions.push([x,y]);
          }
        }
      }
    }
  }
  return squarePositions;
};

Square.prototype.adjacentSquaresCount = function () {
  var count = {
    residential: 0,
    commercial: 0,
    industrial: 0
  };
  
  // get the adjacent squares and iterate
  var squarePositions = this.adjacentSquares(1);
  for (var i = 0; i < squarePositions.length; i++) {
    var position = squarePositions[i];
    var square = this._map.squares[position[0]][position[1]];
    count[square.zone]++;
  }
  return count;
};




var Map = function(mapsize) {
  this.mapsize = mapsize;
  this.population = 0;
  this.countZones = {
    residential: 0,
    commercial: 0,
    industrial: 0
  };
  
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







/**
 * Converts the HTML id into an x,y array
 * e.g. "square-6x5" ==> [6,5]
 */
function getPositionFromID(id) {
  var positionString = id.split('-')[1];
  var positionArray = positionString.split('x');
  return [parseInt(positionArray[0], 10), parseInt(positionArray[1], 10)];
}

/**
 * Converts the HTML id into an x,y array
 * e.g. "square-6x5" ==> [6,5]
 */
function getIDFromPosition(position) {
  return "square-" + position[0] + 'x' + position[1];
}

Map.prototype.updateUI = function(square, type, value) {
  if (value === null) {
    $('#'+getIDFromPosition(square.position)).removeAttr('data-'+type, value);
  }
  else {
    $('#'+getIDFromPosition(square.position)).attr('data-'+type, value);
  }
};









