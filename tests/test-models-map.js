var Map = require('../models/map');

exports.MapSetup = {
  "Square the squares": function (test) {
		var map = new Map.Map(16, {});
		test.equal(map.squares.length, 16); // rows
		test.equal(map.squares[0].length, 16); // columns
		test.done();
  },
}

exports.adjacentSquares = {
  setUp: function (callback) {
		this.map = new Map.Map(16, {});
    callback(); // required!
  },
  tearDown: function (callback) {
		delete this.map;
		callback(); // required!
	},
  "Distance 0: Map Corner": function (test) {
		var map = this.map;
    var adjacent = map.adjacentSquares([0,0], 0)
		test.equal(adjacent.length, 2);
    test.deepEqual(adjacent, [[1,0], [0,1]]);
		test.done();
  },
  "Distance 0: Map Edge": function (test) {
		var map = this.map;
    var adjacent = map.adjacentSquares([8,0], 0)
		test.equal(adjacent.length, 3);
    test.deepEqual(adjacent, [[9,0], [8,1], [7,0]]);
		test.done();
  },
  "Distance 0: Map Center": function (test) {
		var map = this.map;
    var adjacent = map.adjacentSquares([8,8], 0)
		test.equal(adjacent.length, 4);
		test.done();
  },
  
  "Distance 1: Map Corner": function (test) {
		var map = this.map;
    var adjacent = map.adjacentSquares([0,0], 1)
		test.equal(adjacent.length, 3);
    test.deepEqual(adjacent, [ [1,0], [0,1], [1,1] ]);
		test.done();
  },
  "Distance 1: Map Edge": function (test) {
		var map = this.map;
    var adjacent = map.adjacentSquares([8,0], 1);
		test.equal(adjacent.length, 5);
    test.deepEqual(adjacent, [ [7,0], [9,0], [7,1], [8,1], [9,1] ]);
		test.done();
  },
  "Distance 1: Map Center": function (test) {
		var map = this.map;
    var adjacent = map.adjacentSquares([8,8], 1);
		test.equal(adjacent.length, 8);
		test.done();
  },
  "Distance 2: Map Corner": function (test) {
		var map = this.map;
    var adjacent = map.adjacentSquares([0,0], 2);
		test.equal(adjacent.length, 8);
		test.done();
  },
  "Distance 2: Map Edge": function (test) {
		var map = this.map;
    var adjacent = map.adjacentSquares([8,0], 2);
		test.equal(adjacent.length, 14);
		test.done();
  },
  "Distance 2: Map Center": function (test) {
		var map = this.map;
    var adjacent = map.adjacentSquares([8,8], 2);
		test.equal(adjacent.length, 24);
		test.done();
  },
}

exports.adjacentSquaresCount = {
  setUp: function (callback) {    
    var map = new Map.Map(16, {});
  	map.squares[7][0].zone = 'residential';
  	map.squares[7][1].zone = 'commercial'
  	map.squares[8][0].zone = 'road';
  	map.squares[8][1].zone = 'road';
  	map.squares[8][2].zone = 'road';
  	map.squares[8][3].zone = 'road';
  	map.squares[8][4].zone = 'road';
  	map.squares[8][5].zone = 'road';
  	map.squares[8][6].zone = 'road';
  	map.squares[8][7].zone = 'road';
  	map.squares[9][4].zone = 'commercial'
  	map.squares[9][7].zone = 'industrial';
  	this.map = map;
  	callback(); // required!
  },
  tearDown: function (callback) {
		delete this.map;
		callback(); // required!
	},
  "Count Adjacent Squares": function (test) {
	var map = this.map;
    var adjacentCount = map.adjacentSquaresCount([7,0], 1);
    test.deepEqual(adjacentCount, { 
        null: [ [6, 0 ], [ 6, 1 ] ],
        road: [ [ 8, 0 ], [ 8, 1 ] ],
        commercial: [ [ 7, 1 ] ] 
    });
		test.done();
  }
};

exports.globalDemand = {
  setUp: function (callback) {    
    var map = new Map.Map(16, {});
  	map.squares[7][0].zone = 'residential';
  	map.squares[7][1].zone = 'commercial'
  	map.squares[8][0].zone = 'road';
  	map.squares[8][1].zone = 'road';
  	map.squares[8][2].zone = 'road';
  	map.squares[8][3].zone = 'road';
  	map.squares[8][4].zone = 'road';
  	map.squares[8][5].zone = 'road';
  	map.squares[8][6].zone = 'road';
  	map.squares[8][7].zone = 'road';
  	map.squares[9][4].zone = 'commercial'
  	map.squares[9][7].zone = 'industrial';
  	this.map = map;
  	callback(); // required!
  },
  tearDown: function (callback) {
		delete this.map;
		callback(); // required!
	},
  "External Market Multiplier": function (test) {
	  var map = this.map;
    map.age = 0;
    test.equal(map.globalDemand().externalMarketMultiplier, 1.2000000000000002);
    map.age = 50;
    test.equal(map.globalDemand().externalMarketMultiplier, 1);
    map.age = 100;
    test.equal(map.globalDemand().externalMarketMultiplier, .8);
		test.done();
  },
  "Projected Populations": function (test) {
	  var map = this.map;
    map.residents = 110000;
    map.jobs.commercial = 80000;
    map.jobs.industrial = 25000;
    var results = map.globalDemand();
    test.equal(results.projectedResidents, 107200);
    test.equal(results.projectedCommercialJobs, 60875);
    test.equal(results.projectedIndustrialJobs, 31429);
    test.done();
  },
  "Effect Demand": function (test) {
	  var map = this.map;
    var results = map.globalDemand();
    test.equal(map.demand.residential, 650);
    test.done();
  }
  
  
};