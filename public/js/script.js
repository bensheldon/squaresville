var socket = io.connect('http://'+HOST+'/');

socket.on('connect', function () {
  socket.on('age', function (message) {
    $('#stats #age').text(message);
  });
  
  socket.on('updateSquare', function (message) {
    console.log(message);
    var square = message.square;
    var htmlSquare = $('#' + getIDFromPosition(square.position));
    htmlSquare.attr("data-zone", square.zone);
    htmlSquare.attr("data-density", square.density);
  });
  
  socket.on('updateMap', function (message) {
    var map = message.map;
    $('#population').text(map.residents);
    $('#age').text(map.age);
    $('#demand-residential').text(map.demand.residential);
    $('#demand-commercial').text(map.demand.commercial);
    $('#demand-industrial').text(map.demand.industrial);
  });
  
  socket.on('service', function (message) {
    $('#messages').text(message);
  });
  
});


$(document).ready(function(){
  // Event delegation, a la 24 Ways: 
  // http://24ways.org/2011/your-jquery-now-with-less-suck
  $('table#map').on('click','td',function() {
    var thisSquare = $(this);
    var id = thisSquare.attr("id");
    var position = getPositionFromID(id);
    
    switch(thisSquare.attr("data-zone")) {
      case undefined:
        socket.emit('rezone', {
          position: [position[0], position[1]],
          zone: 'residential'
        });
        break;
       
      case 'residential':
        socket.emit('rezone', {
          position: [position[0], position[1]],
          zone: 'commercial'
        });
        break;
        
      case 'commercial':
        socket.emit('rezone', {
          position: [position[0], position[1]],
          zone: 'industrial'
        });
        break;
        
      case 'industrial':
        socket.emit('rezone', {
          position: [position[0], position[1]],
          zone: 'road'
        });
        break;
 
      case 'road':
      default:
        socket.emit('rezone', {
          position: [position[0], position[1]],
          zone: null
        });
        break;
        
    }
  });
});

/**
 * Converts the HTML id into an x,y array
 * e.g. "square-6x5" ==> [6,5]
 */
function getPositionFromID(id) {
  var positionString = id.split('-')[1];
  var positionArray = positionString.split('x');
  return [parseInt(positionArray[0]), parseInt(positionArray[1])];
}

/**
 * Converts the HTML id into an x,y array
 * e.g. "square-6x5" ==> [6,5]
 */
function getIDFromPosition(position) {
  return "square-" + position[0] + 'x' + position[1];
}