var MAPSIZE = 8;
var MAXDENSITY = 3;
var LOOPTIME = 1000;
var GROWTHRATE = 0.02;
var mapAge = 0;

var map = new Map(MAPSIZE);

/**
 * Game Loop
 */
var loop = function() {

  map.scanMap( function(square) { 
    square.calcMaxDensity();
  });

  mapAge++;
  setTimeout(loop, LOOPTIME); //restart
}
$(document).ready(function(){
  loop();
});

$(document).ready(function(){
  // Event delegation, a la 24 Ways: 
  // http://24ways.org/2011/your-jquery-now-with-less-suck
  $('table#map').on('click','td',function() {
    var thisSquare = $(this);
    var id = thisSquare.attr("id");
    var position = getPositionFromID(id);
    
    if (thisSquare.attr("data-zone") === undefined) {
      thisSquare.attr("data-zone", 'residential');
      thisSquare.attr("data-density", 0);
      map.squares[position[0]][position[1]].rezone('residential');
    }
    else if (thisSquare.attr("data-zone") === 'residential') {
      thisSquare.attr("data-zone", 'commercial');
      thisSquare.attr("data-density", 0);
      map.squares[position[0]][position[1]].rezone('commercial');
      
    }
    else if (thisSquare.attr("data-zone") === 'commercial') {
      thisSquare.attr("data-zone", 'industrial');
      thisSquare.attr("data-density", 0);
      map.squares[position[0]][position[1]].rezone('industrial');
    }
    else if (thisSquare.attr("data-zone") === 'industrial') {
      thisSquare.attr("data-zone", 'road');
      thisSquare.removeAttr("data-density");
      map.squares[position[0]][position[1]].rezone('road');
    }
    else {
      thisSquare.removeAttr("data-zone");
      thisSquare.removeAttr("data-density");
      map.squares[position[0]][position[1]].rezone(null);
    }
  });
});



