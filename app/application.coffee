$ ->
  socket = io.connect("http://#{HOST}/")

  socket.on "connect", ->
    socket.on "age", (message) ->
      $("#stats #age").text message

    socket.on "updateSquare", (message) ->
      console.log message
      square = message.square
      htmlSquare = $("#" + getIDFromPosition(square.position))
      htmlSquare.attr "data-zone", square.zone
      htmlSquare.attr "data-density", square.density

    socket.on "updateMap", (message) ->
      map = message.map
      $("#age").text map.age
      $("#residents").text map.residents
      $("#jobs-commercial").text map.jobs.commercial
      $("#jobs-industrial").text map.jobs.industrial
      $("#demand-residential").text map.demand.residential
      $("#demand-commercial").text map.demand.commercial
      $("#demand-industrial").text map.demand.industrial

    socket.on "service", (message) ->
      $("#messages").text message

  # Event delegation, a la 24 Ways:
  # http://24ways.org/2011/your-jquery-now-with-less-suck
  $("table#map").on "click", "td", ->
    thisSquare = $(this)
    id = thisSquare.attr("id")
    position = getPositionFromID(id)
    switch thisSquare.attr("data-zone")
      when `undefined`
        socket.emit "rezone",
          position: [position[0], position[1]]
          zone: "residential"

      when "residential"
        socket.emit "rezone",
          position: [position[0], position[1]]
          zone: "commercial"

      when "commercial"
        socket.emit "rezone",
          position: [position[0], position[1]]
          zone: "industrial"

      when "industrial"
        socket.emit "rezone",
          position: [position[0], position[1]]
          zone: "road"

      when "road"
      else
        socket.emit "rezone",
          position: [position[0], position[1]]
          zone: null


###
Converts the HTML id into an x,y array
e.g. "square-6x5" ==> [6,5]
###
getPositionFromID = (id) ->
  positionString = id.split("-")[1]
  positionArray = positionString.split("x")
  [parseInt(positionArray[0]), parseInt(positionArray[1])]

###
Converts the HTML id into an x,y array
e.g. "square-6x5" ==> [6,5]
###
getIDFromPosition = (position) ->
  "square-" + position[0] + "x" + position[1]
