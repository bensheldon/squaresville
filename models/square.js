var Travel = require('./travel.js').Travel
	, _ = require('underscore');


var Square = function(map, position) {
  this.position = [position[0], position[1]];
  this.zone = null;         // type of zone
  this.residents = 0;       // how many people live here (0 <> 1000)
  this.jobs = 0;            // how many people can be employed here (0 <> 600)
  this.growthRate = 0;      // how quickly are residents/jobs increasing (-200 <> 200)
  this.landValue = 0;       // what is the perceived value of this square (0 <> 500,000)
  this.transit = false;     // can other zones be reached (true | false)
  this.pollution = 0;       // level of pollution (0 <> 5)
  this.polluter = false;    // the zone produces pollution (true | false)
  this.density = 0;         // how jammed together is the zone (0 <> 5)
  this._map = map;          // the map the square is a part of
};

Square.prototype.rezone = function(zone) {
  this._map.residents -= this.residents;
  this.zone      = zone;
  this.residents = 0;
  this.jobs      = 0;
  this.density   = 0;
  this.transit   = false;
  this._map.updateUiSquare(this);
};

Square.prototype.doZone = function() {
  switch(this.zone) {
    case 'residential':
      this.doResidential();
      break;
    case 'commercial':
      this.doCommercial();
      break;
    case 'industrial':
      this.doIndustrial();
      break;  
  }
}

Square.prototype.doResidential = function() {
  var growResidents = 0
    
  if ( (this._map.demand.residential > 0) 
    && (this.transit === true) ) {
    
    // if population is zero
    if (this.residents == 0) {
      growResidents = 1; // default growth;
    }
    else { // (this.residents > 0)
      growResidents = this.residents * (this._map.demand.residential / 100);
      growResidents = Math.ceil( growResidents * ((5 - this.pollution) / 5) );
    }
  } else {
    if (this.residents == 0) {
      this.growthRate = 0;
      this.residents = 0;
    }
    else { // (this.residents > 0)
      if (this.transit == true) {
        // globalDemand is now negative
        growResidents = 0.3 * this.residents * (this._map.demand.residential / 100);
        // pollution should accelerate the negative growth, here it accelerates to twice
        growResidents = Math.ceil( growResidents * ( 1 + this.pollution / 10 ) );
      }
      else { // (this.transit == false)
        // globalDemand but no transit connection 
        growResidents = -0.10 * this.residents;
      }
    }
  }

  growResidents = this.tryResidentialBuild(growResidents);
  
  // calculate growthRate
  if (this.residents > 0) {
    this.growthRate = Math.round( (growResidents / this.residents) * 100 );
  }
  else {
    if (growResidents > 0) {
      this.growthRate = 100;
    }
    else {
      this.growthRate = 0;
    }
  }
  // and finally add them to the square and map
  this.residents += growResidents;
  this._map.residents += growResidents;
}

Square.prototype.doCommercial = function() {
  var newJobs = 0
    
  if ( (this._map.demand.commercial > 0) 
    && (this.transit === true) ) {
    
    // if current jobs is zero
    if (this.jobs == 0) {
      newJobs = 1; // default growth;
    }
    else { // (this.jobs > 0)
      newJobs = Math.ceil(this.jobs * (this._map.demand.commercial / 100));
    }
  } else {
    if (this.jobs == 0) {
      newJobs = 0;
    }
    else { // (this.jobs > 0)
      if (this.transit == true) {
        // Demand is now negative
        newJobs = Math.ceil(0.3 * this.jobs * (this._map.demand.commercial / 100));
      }
      else { // (this.transit == false)
        // Demand but no transit connection 
        newJobs = -0.10 * this.jobs;
      }
    }
  }

  // Try to build out a larger building/larger density
  newJobs = this.tryCommercialBuild(newJobs);
  
  // calculate growthRate
  if (this.jobs > 0) {
    this.growthRate = Math.round( (newJobs / this.jobs) * 100 );
  }
  else {
    if (newJobs > 0) {
      this.growthRate = 100;
    }
    else {
      this.growthRate = 0;
    }
  }
  // and finally add them to the square and map
  this.jobs += newJobs;
  this._map.jobs.commercial += newJobs;
}

Square.prototype.doIndustrial = function() {
  var newJobs = 0
    
  if ( (this._map.demand.industrial > 0) 
    && (this.transit === true) ) {
    
    // if population is zero
    if (this.jobs == 0) {
      newJobs = 1; // default growth;
    }
    else { // (this.jobs > 0)
      newJobs = Math.ceil(this.jobs * (this._map.demand.industrial / 100));
    }
  } else {
    if (this.jobs == 0) {
      newJobs = 0;
    }
    else { // (this.jobs > 0)
      if (this.transit == true) {
        // Demand is now negative
        newJobs = Math.ceil(0.3 * this.jobs * (this._map.demand.industrial / 100));
      }
      else { // (this.transit == false)
        // Demand but no transit connection 
        newJobs = -0.10 * this.jobs;
      }
    }
  }

  // Try to build out a larger building/larger density
  newJobs = this.tryIndustrialBuild(newJobs);
  
  // calculate growthRate
  if (this.jobs > 0) {
    this.growthRate = Math.round( (newJobs / this.jobs) * 100 );
  }
  else {
    if (newJobs > 0) {
      this.growthRate = 100;
    }
    else {
      this.growthRate = 0;
    }
  }
  // and finally add them to the square and map
  this.jobs += newJobs;
  this._map.jobs.industrial += newJobs;
}

Square.prototype.tryResidentialBuild = function(newResidents) {
  var residentialBase = 8;
  
  // The residential Capacity of building are 1, 8, 64, 512
  if ((this.residents + newResidents) <= Math.pow(residentialBase, this.density)) {
    if (this.density < 3) {
      this.density += 1;
      this._map.updateUiSquare(this);
    }
  }
  else {
    // No more room to grow
    newResidents = 0;
  }
  return newResidents;
}

Square.prototype.tryCommercialBuild = function(newJobs) {
  var commercialBase = 6;
  
  // The residential Capacity of building are 1, 6, 36, 216
  if ( (this.jobs + newJobs) <= Math.pow(commercialBase, this.density)) {
    if (this.density < 3) {
      this.density += 1;
      this._map.updateUiSquare(this);
    }
  }
  else {
    // No more room to grow
    newJobs = 0;
  }
  return newJobs;
}

Square.prototype.tryIndustrialBuild = function(newJobs) {
  var industrialBase = 9;
  
  // The residential Capacity of building are 1, 9, 81, 729
  if ((this.jobs + newJobs) <= Math.pow(industrialBase, this.density) ) {
    if (this.density < 3) {
      this.density += 1;
      this._map.updateUiSquare(this);
    }
  }
  else {
    // No more room to grow
    newJobs = 0;
  }
  return newJobs; 
}



Square.prototype.doTransit = function() {
  
  switch(this.zone) {
    case 'residential':
      var indTrip = new Travel(this._map, this.position, 'commercial');
      var comTrip = new Travel(this._map, this.position, 'industrial');
            
      if (indTrip && comTrip) {
        this.transit = true;
      }
      else if(indTrip && (this._map.residents < 100) ) {
        // if less than 100 residents, we'll ignore commercial
        this.transit = true;
      }
      else {
        this.transit = false;
      }
      break;
    case 'commercial':
	    var resTrip = new Travel(this._map, this.position, 'residential');
	    var indTrip = new Travel(this._map, this.position, 'industrial');
      
	    if (resTrip && indTrip) {
	      this.transit = true;
	    }
	    else {
	      this.transit = false;
	    }
      break;
    case 'industrial':
      var resTrip = new Travel(this._map, this.position, 'residential');
      if (resTrip) {
        this.transit = true;
      }
      else {
        this.transit = false;
      }
      console.log(this.transit);
      break;
  }
}

exports.Square = Square;