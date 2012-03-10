var MAPSIZE = 8;
var MAXDENSITY = 3;
var LOOPTIME = 1000;
var ZONETYPES = {};
var mapAge = 0;



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









