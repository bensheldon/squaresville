var GROWTHRATE = 0.02;

var Square = function(map, position, zone) {
  this.population = 0;
  this.populationCap = 0;
  this.zone = null;
  this.density = 0;
  this.position = [position[0], position[1]];
  this._map = map; // reference the parent map (not sure if this is correct)
};

Square.prototype.rezone = function(zone) {
  this.zone = zone;
  this._map.population -= this.population;
  this.population = 0;
  this._map.updateUiSquare(this);
};

Square.prototype.calcPopulation = function() {
  switch(this.zone) {
    case 'residential':
      this.calcPopulationResidential();
      break;
    case 'commercial':
      break;
  }
}

Square.prototype.calcPopulationResidential = function() {
  var growPopulation = 0
  // if population is zero
  if (this.population == 0) {
    var growPopulation = 4; // default growth;
    this.population += growPopulation;
    this._map.population += growPopulation;
    this.density = 1;
    this.populationCap = 8;
    this._map.updateUiSquare(this);
  }
  else {
    // try to grow the population
    var growPopulation = Math.ceil(this.population * GROWTHRATE);
    
    // check if the population is less than the density
    if ( (this.population + growPopulation) <= (this.populationCap) ) {
      this.population += growPopulation;
      this._map.population += growPopulation;
    }
    // otherwise try to increase the density
    else if (this.density < 3) {
      this.population += growPopulation;
      this._map.population += growPopulation;
      this.density++; // update the density
      this.populationCap = Math.pow(10, this.density)
      this._map.updateUiSquare(this);
    }
  }
}

Square.prototype.calcMaxDensity = function() {
  switch(this.zone) {
    case 'residential':
      if (this.RecalcMaxDensityResidential()) {
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

Square.prototype.adjacentSquaresCount = function (distance) {
  var count = {
    residential: 0,
    commercial: 0,
    industrial: 0
  };
  
  // get the adjacent squares and iterate
  var squarePositions = this.adjacentSquares(distance);
  for (var i = 0; i < squarePositions.length; i++) {
    var position = squarePositions[i];
    var square = this._map.squares[position[0]][position[1]];
    count[square.zone]++;
  }
  return count;
};

exports.Square = Square;