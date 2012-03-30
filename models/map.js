var Square = require('./square.js').Square
  , _ = require('underscore');

var MAXDEMAND = 100; 

var Map = function(mapsize, emitter) {
  this.age = 0;
  this.emitter = emitter;
  this.mapsize = mapsize;
  this.residents = 0;
  this.jobs = {
    commercial: 0,
    industrial: 0
  };
  this.demand = {
    residential: 500,
    commercial: 0,
    industrial: 500
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

Map.prototype.globalDemand = function() {
  var internalMarketDenom = 3.7
    , projectedIndJobsMin  = 5
    , businessCycle       = 200   // length of 1/2 full business cycle in age
    , birthRate           = 0.02
    , resRatioDefault     = 1.3
    , ratioMax            = 2
    , baseMax             = 1.3 // Used for laborBase and employmentBase
    , ratioEffect         = 1
  ;  
  
  // cycle external demand multiplier between .8 and 1.2
  var externalMarketMultiplier = 0.80 + (Math.cos(Math.PI * (this.age % businessCycle) / (businessCycle/2)) + 1) / 5;

  var laborBase // LaborBase: residents per job
    , jobsBase  // JobsBase: jobs per resident
    , jobsTotal = this.jobs.commercial + this.jobs.industrial;
  if (jobsTotal > 0) {
    laborBase = Math.min( this.residents / (jobsTotal), baseMax);
  }
  else {
    laborBase = 1;
  }
  if (this.residents > 0) {
    jobsBase = Math.min( (this.jobs.commercial + this.jobs.industrial) / this.residents, baseMax);
  } else {
    jobsBase = 1;  
  }
  /** 
   * Calculate Projected Residential Population
   */
  var migrations = Math.round(this.residents * (jobsBase - 1)); 
    // If more jobs than residents, people move in; if less, they move out
  var births     = Math.round(this.residents * birthRate);
  var projectedResidents = this.residents + migrations + births;
  
  /** 
   * Calculate Projected Commercial Jobs
   */
   var internalMarket = (this.residents + this.jobs.commercial + this.jobs.industrial) / internalMarketDenom;
   var projectedCommercialJobs = Math.round(internalMarket * laborBase);
  
   /** 
    * Calculate Projected Industrial Jobs
    */
    var projectedIndustrialJobs = Math.round(this.jobs.industrial * laborBase * externalMarketMultiplier);
    projectedIndustrialJobs = Math.max(projectedIndustrialJobs, projectedIndJobsMin);

    /** 
     * Set Demand Ratios of projected to actual
     */
    var residentialRatio, commercialRatio, industrialRatio;
    
    if (this.residents > 0) {
      residentialRatio = projectedResidents / this.residents;
    }
    else {
      residentialRatio = resRatioDefault;
    }
    
    if (this.jobs.commercial > 0) {
      commercialRatio = projectedCommercialJobs / this.jobs.commercial;
    }
    else {
      commercialRatio = projectedCommercialJobs;
    }
    
    if (this.jobs.industrial > 0) {
      industrialRatio = projectedIndustrialJobs / this.jobs.industrial;
    }
    else {
      industrialRatio = projectedIndustrialJobs;
    }
    
    residentialRatio = Math.min(residentialRatio, ratioMax);
    commercialRatio = Math.min(commercialRatio, ratioMax);
    industrialRatio = Math.min(industrialRatio, ratioMax);
    
  
    // Change the velocity of demand as mediated by the RATIOEFFECT
    // Add 1 just so it never gets totally stuck with a zero multiplier
    this.demand.residential += 1 + this.demand.residential * (residentialRatio - 1) / ratioEffect; // half the effect of the demand
    this.demand.commercial += 1 + this.demand.commercial * (commercialRatio - 1) / ratioEffect; // half the effect of the demand
    this.demand.industrial += 1 + this.demand.industrial * (industrialRatio - 1) / ratioEffect; // half the effect of the demand
    
    this.demand.residential = Math.max(-MAXDEMAND, Math.min(MAXDEMAND, this.demand.residential));
    this.demand.commercial = Math.max(-1*MAXDEMAND, Math.min(MAXDEMAND, this.demand.commercial));
    this.demand.industrial = Math.max(-1*MAXDEMAND, Math.min(MAXDEMAND, this.demand.industrial));
    
    this.demand.residential = Math.floor(this.demand.residential);
    this.demand.commercial = Math.floor(this.demand.commercial);
    this.demand.industrial = Math.floor(this.demand.industrial);
  
    // return some values for easy debugging/testing
    return { 
      laborBase: laborBase,
      jobsBase: jobsBase,
      residentialRatio: residentialRatio,
      commercialRatio: commercialRatio,
      industrialRatio: industrialRatio,
      externalMarketMultiplier: externalMarketMultiplier,
      internalMarket: internalMarket,
      projectedResidents: projectedResidents,
      projectedCommercialJobs: projectedCommercialJobs,
      projectedIndustrialJobs: projectedIndustrialJobs
    }
}

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