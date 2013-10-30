var Travel = require('../../lib/models/travel');
var Map = require('../../lib/models/map');

exports.Travel = {
  setUp: function (callback) {
    var map = new Map.Map(16, {});
  	map.squares[7][0].zone = 'residential';
  	map.squares[7][1].zone = 'commercial'
  	map.squares[8][2].zone = 'road';
  	map.squares[8][3].zone = 'road';
  	map.squares[8][4].zone = 'road';
    map.squares[8][5].zone = 'road';
    map.squares[8][6].zone = 'road';
    map.squares[8][7].zone = 'road';
  	map.squares[9][3].zone = 'road';
  	map.squares[10][3].zone = 'road';
  	map.squares[10][4].zone = 'road';
  	map.squares[10][5].zone = 'road';
  	map.squares[10][6].zone = 'road';
  	map.squares[10][7].zone = 'road';
  	map.squares[10][8].zone = 'road';

  	map.squares[9][4].zone = 'commercial';
  	map.squares[9][9].zone = 'industrial';
    // setup a short strip
  	map.squares[11][0].zone = 'residential';
  	map.squares[14][0].zone = 'road';
  	map.squares[15][0].zone = 'commercial';
  	this.map = map;
  	callback(); // required!
  },
  tearDown: function (callback) {
		delete this.mao;
		callback(); // required!
	},
  "Absense of a nearby road leads to failure": function(test) {
  	var trip = Travel.Travel(this.map, [0,0], 'commercial');
    test.equal(trip, false);
    test.done();
  },
  "Walk from residential to commercial": function (test) {
  	var trip = Travel.Travel(this.map, [7,0], 'commercial');
    test.equal(trip.method, 'walk');
    test.deepEqual(trip.destination, [7,1]);
    test.done();
  },
  "Try to drive across a single street": function (test) {
  	var trip = Travel.Travel(this.map, [12,0], 'commercial');
    test.equal(trip.method, 'drive');
    test.deepEqual(trip.destination, [15,0]);
    test.done();
  },
  "Try to drive a distance down a street": function (test) {
  	var trip = Travel.Travel(this.map, [7,0], 'industrial');
    test.equal(trip.method, 'drive');
    test.deepEqual(trip.destination, [9,9]);
    console.log(trip.route);
    test.done();
  },


}
