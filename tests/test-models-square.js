var Square = require('../models/square');

exports.doResidential = {
  setUp: function (callback) {
	  var map = {
      residents: 0,
      jobs: {
        commercial: 0,
        industrial:0
      },
		  demand: {
  			residential:  10, 
  			commercial:	  10,
  			industrial:   10
		  }
	  }
    this.square = new Square.Square(map, [0,0]);
		this.square.transit = true;
    callback(); // required!
  },
  tearDown: function (callback) {
		delete this.square;
		callback(); // required!
	},
  "Zero population grows to 1": function (test) {
		var square = this.square;
		square.residents = 0;
		square.doResidential();
		test.equal(square.residents, 1, 'should increase to 1 resident');
		test.equal(square.growthRate, 100, 'should be 100% growth')
		test.done();
  },
  "Zero population doesn't grow b/c of no demand": function (test) {
		var square = this.square;
		square.residents = 0;
		square._map.demand.residential = -20;
		square.doResidential();
		test.equal(square.residents, 0);
		test.equal(square.growthRate, 0);
		test.done();
  },
  "Population of 1 grows according to demand": function (test) {
		var square = this.square;
		square.residents = 1;
		square._map.demand.residential = 100;
		square.doResidential();
		test.equal(square.residents, 2);
		test.equal(square.growthRate, 100)
    console.log(square);
		test.done();
  },
  "Population of 80 grows according to demand & pollution": function (test) {
		var square = this.square;
		square.residents = 80;
		square.pollution = 2;
		square._map.demand.residential = 30;
		square.doResidential();
		test.equal(square.residents, 95);
		test.equal(square.growthRate, 19)
		test.done();
  },
  "Negative demand should decrease population": function (test) {
		var square = this.square;
		square.residents = 80;
		square.pollution = 2;
		square._map.demand.residential = -30;
		square.doResidential();
		test.equal(square.residents, 72);
		test.equal(square.growthRate, -10)
		test.done();
  },
  "No transit should decrease population": function (test) {
		var square = this.square;
		square.residents = 100;
		square.pollution = 0;
		square.transit = false;
		square._map.demand.residential = 100;
		square.doResidential();
		test.equal(square.residents, 90);
		test.equal(square.growthRate, -10)
		test.done();
  },
	
  "Should never have population less than 0": function (test) {
		var square = this.square;
		square.residents = 2;
		square.pollution = 5;
		square._map.demand.residential = -100;
		square.doResidential();
		test.ok(square.residents >= 0);
		test.done();
  },
	
  "Should never have population greater than 1000": function (test) {
		var square = this.square;
		square.residents = 999;
		square.pollution = 1;
		square._map.demand.residential = 85;
		square.doResidential();
		test.ok(square.residents < 1001);
		test.done();
  },
}

exports.doIndustrial = {
  setUp: function (callback) {
	  var map = {
      residents: 0,
      jobs: {
        commercial: 0,
        industrial:0
      },
		  demand: {
  			residential:  10, 
  			commercial:	  10,
  			industrial:   10
		  }
	  }
    this.square = new Square.Square(map, [0,0]);
    this.square.zone = 'industrial';
		this.square.transit = true;
    callback(); // required!
  },
  tearDown: function (callback) {
		delete this.square;
		callback(); // required!
	},
  "Zero jobs grows to 1": function (test) {
		var square = this.square;
		square.jobs = 0;
		square.doIndustrial();
		test.equal(square.jobs, 1);
		test.equal(square.growthRate, 100);
		test.done();
  },
  "Zero jobs doesn't grow b/c of no demand": function (test) {
		var square = this.square;
		square.jobs = 0;
		square._map.demand.industrial = -20;
		square.doIndustrial();
		test.equal(square.jobs, 0);
		test.equal(square.growthRate, 0);
		test.done();
  },
  "With 1 job, zone grows according to demand": function (test) {
		var square = this.square;
		square.jobs = 1;
		square._map.demand.industrial = 100;
		square.doIndustrial();
		test.equal(square.jobs, 2);
		test.equal(square.growthRate, 100)
    console.log(square);
		test.done();
  },
  "With 80 jobs, zone grows according to demand": function (test) {
		var square = this.square;
		square.jobs = 80;
		square._map.demand.industrial = 30;
		square.doIndustrial();
		test.equal(square.jobs, 104);
		test.equal(square.growthRate, 30)
		test.done();
  },
  "Negative demand should decrease jobs": function (test) {
		var square = this.square;
		square.jobs = 80;
		square._map.demand.industrial = -30;
		square.doIndustrial();
		test.equal(square.jobs, 73);
		test.equal(square.growthRate, -9)
		test.done();
  },
  "No transit should decrease jobs": function (test) {
		var square = this.square;
		square.jobs = 100;
		square.transit = false;
		square._map.demand.industrial = 100;
		square.doIndustrial();
		test.equal(square.jobs, 90);
		test.equal(square.growthRate, -10)
		test.done();
  },
	
  "Should never have jobs of less than 0": function (test) {
		var square = this.square;
		square.jobs = 2;
		square._map.demand.industrial = -100;
		square.doIndustrial();
		test.ok(square.jobs >= 0);
		test.done();
  },
	
  "Should never have jobs of greater than 1000": function (test) {
		var square = this.square;
		square.jobs = 999;
		square._map.demand.industrial = 85;
		square.doIndustrial();
		test.ok(square.jobs < 1001);
		test.done();
  },
}
