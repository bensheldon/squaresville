var Square = function(map, position) {
  this.position = [position[0], position[1]];
  this.zone = null;         // type of zone
  this.residents = 0;       // how many people live here (0 <> 1000)
  this.jobs = 0;            // how many people can be employed here (0 <> 600)
  this.growthRate = 0;      // how quickly are residents/jobs increasing (-200 <> 200)
  this.landValue = 0;       // what is the perceived value of this square (0 <> 500,000)
  this.transit = true;     // can other zones be reached (true | false)
  this.pollution = 0;       // level of pollution (0 <> 5)
  this.polluter = false;    // the zone produces pollution (true | false)
  this.density = 0;         // how jammed together is the zone (0 <> 5)
  this._map = map;          // the map the square is a part of
};

Square.prototype.rezone = function(zone) {
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

  // population should never exceed 1000
  if ((this.residents + growResidents) > 1000) {
    growResidents = 1000 - this.residents;
  }
  

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
  // and finally add them to thd square and map
  this.residents += growResidents;
  this._map.residents += growResidents;

}

exports.Square = Square;