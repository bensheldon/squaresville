var Square = function(map, position) {
  this.zone = null; 		  // type of zone
  this.residents = 0; 		// how many people live here (0 <> 1000)
  this.jobs = 0; 			    // how many people can be employed here (0 <> 600)
  this.growthRate = 0; 		// how quickly are residents/jobs increasing (-200 <> 200)
  this.landValue = 0; 		// what is the perceived value of this square (0 <> 500,000)
  this.transit = false; 	// can other zones be reached (true | false)
  this.pollution = 0; 		// level of pollution (0 <> 5)
  this.polluter = false;	// the zone produces pollution (true | false)
  this.density = 0;			  // how jammed together is the zone (0 <> 5)
  this.position = [position[0], position[1]];
  this._map = map;			  // the map the square is a part of
};

Square.prototype.rezone = function(zone) {
  this.zone = zone;
  this.population = 0;
  this._map.updateUiSquare(this);
};

Square.prototype.calcResidents = function() {
  switch(this.zone) {
    case 'residential':
      this.calcResidents(globalDemand);
      break;
    case 'commercial':
      break;
  }
}

Square.prototype.calcResidents = function(globalDemand) {
  var growResidents = 0
  
  if ( (globalDemand.residential > 0) 
    && (this.transit == true) ) {
      
    // if population is zero
    if (this.residents == 0) {
      growResidents = 1; // default growth;
      this.growthRate = 100;
      this.residents += growResidents;
    }
    else { // (this.residents > 0)
      growResidents = this.residents * (globalDemand.residential / 100);
      growResidents = Math.ceil( growResidents * ((5 - this.pollution) / 5) );
      this.growthRate = Math.round( (growResidents / this.residents) * 100 );
      this.residents += growResidents;
      this.residents = Math.min(this.residents, 1000);
    }
  } else {
    if (this.residents == 0) {
      this.growthRate = 0;
      this.residents = 0;
    }
    else { // (this.residents > 0)
      
      if (this.transit == true) {
        // globalDemand is now negative
        growResidents = 0.3 * this.residents * (globalDemand.residential / 100);
        growResidents = Math.ceil( growResidents * ( 1 + this.pollution / 10 ) );
          // pollution should accelerate the negative growth, here it accelerates to twice
        this.growthRate = Math.round( (growResidents / this.residents) * 100 );
        this.residents += growResidents;
        this.residents = Math.max(this.residents, 0);
      }
      else { // (this.transit == false)
        // globalDemand but no transit connection 
        growResidents = -0.10 * this.residents;
        this.growthRate = Math.round( (growResidents / this.residents) * 100 );
        this.residents += growResidents;
        this.residents = Math.max(this.residents, 0);
      }
    }
  }
}

exports.Square = Square;