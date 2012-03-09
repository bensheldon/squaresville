var socket = io.connect('http://localhost:3000/');

socket.on('connect', function () {
	socket.on('heartbeat', function (message) {
	  $('#time').text(message);
	});
  
	socket.on('service', function (message) {
	  $('#messages').text(message);
	});
  
});