var Square = require('../models/square');

exports.calcResidents = {
  setUp: function (callback) {
    this.square = new Square.Square({}, [0,0]);
		this.square.transit = true;
		this.globalDemand = {
			residential:  10, 
			commercial:	  10,
			industrial:   10
		};
    callback(); // required!
  },
  tearDown: function (callback) {
		delete this.square;
		delete this.globalDemand;
		callback(); // required!
	},
  "Zero population grows to 1": function (test) {
		var square = this.square;
		var globalDemand = this.globalDemand;
		square.residents = 0;
		square.calcResidents(globalDemand);
		test.equal(square.residents, 1, 'should increase to 1 resident');
		test.equal(square.growthRate, 100, 'should be 100% growth')
		test.done();
  },
  "Zero population doesn't grow b/c of no demand": function (test) {
		var square = this.square;
		var globalDemand = this.globalDemand;
		square.residents = 0;
		globalDemand.residential = -20;
		square.calcResidents(globalDemand);
		test.equal(square.residents, 0);
		test.equal(square.growthRate, 0);
		test.done();
  },
  "Population of 1 grows according to demand": function (test) {
		var square = this.square;
		var globalDemand = this.globalDemand;
		square.residents = 1;
		globalDemand.residential = 100;
		square.calcResidents(globalDemand);
		test.equal(square.residents, 2);
		test.equal(square.growthRate, 100)
		test.done();
  },
  "Population of 80 grows according to demand & pollution": function (test) {
		var square = this.square;
		var globalDemand = this.globalDemand;
		square.residents = 80;
		square.pollution = 2;
		globalDemand.residential = 30;
		square.calcResidents(globalDemand);
		test.equal(square.residents, 95);
		test.equal(square.growthRate, 19)
		test.done();
  },
  "Negative demand should decrease population": function (test) {
		var square = this.square;
		var globalDemand = this.globalDemand;
		square.residents = 80;
		square.pollution = 2;
		globalDemand.residential = -30;
		square.calcResidents(globalDemand);
		test.equal(square.residents, 72);
		test.equal(square.growthRate, -10)
		test.done();
  },
  "No transit should decrease population": function (test) {
		var square = this.square;
		var globalDemand = this.globalDemand;
		square.residents = 100;
		square.pollution = 0;
		square.transit = false;
		globalDemand.residential = 100;
		square.calcResidents(globalDemand);
		test.equal(square.residents, 90);
		test.equal(square.growthRate, -10)
		test.done();
  },
	
  "Should never have population less than 0": function (test) {
		var square = this.square;
		var globalDemand = this.globalDemand;
		square.residents = 2;
		square.pollution = 5;
		globalDemand.residential = -100;
		square.calcResidents(globalDemand);
		test.ok(square.residents >= 0);
		test.done();
  },
	
  "Should never have population greater than 1000": function (test) {
		var square = this.square;
		var globalDemand = this.globalDemand;
		square.residents = 999;
		square.pollution = 1;
		globalDemand.residential = 85;
		square.calcResidents(globalDemand);
		test.ok(square.residents < 1001);
		test.done();
  },
	
	
}