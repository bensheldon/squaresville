_ = require("underscore")

config = require("../config")
Square = require("./square")

class Map
  constructor: (mapsize, emitter) ->
    @age = 0
    @emitter = emitter
    @mapsize = mapsize
    @residents = 0
    @jobs =
      commercial: 0
      industrial: 0

    @demand =
      residential: 500
      commercial: 0
      industrial: 500

    # Setup our squares
    @squares = [mapsize]
    x = 0

    while x < @mapsize
      column = [@mapsize]
      y = 0

      while y < @mapsize
        column[y] = new Square(this, [x, y])
        y++
      @squares[x] = column
      x++

  globalDemand: ->
    internalMarketDenom = 3.7
    projectedIndJobsMin = 5
    businessCycle = 200 # length of 1/2 full business cycle in age
    birthRate = 0.02
    resRatioDefault = 1.3
    ratioMax = 2
    baseMax = 1.3 # Used for laborBase and employmentBase
    ratioEffect = 1

    # cycle external demand multiplier between .8 and 1.2
    externalMarketMultiplier = 0.80 + (Math.cos(Math.PI * (@age % businessCycle) / (businessCycle / 2)) + 1) / 5
    laborBase = undefined # LaborBase: residents per job
    jobsBase = undefined
    # JobsBase: jobs per resident
    jobsTotal = @jobs.commercial + @jobs.industrial
    if jobsTotal > 0
      laborBase = Math.min(@residents / (jobsTotal), baseMax)
    else
      laborBase = 1
    if @residents > 0
      jobsBase = Math.min((@jobs.commercial + @jobs.industrial) / @residents, baseMax)
    else
      jobsBase = 1

    ###
    Calculate Projected Residential Population
    ###
    migrations = Math.round(@residents * (jobsBase - 1))

    # If more jobs than residents, people move in; if less, they move out
    births = Math.round(@residents * birthRate)
    projectedResidents = @residents + migrations + births

    ###
    Calculate Projected Commercial Jobs
    ###
    internalMarket = (@residents + @jobs.commercial + @jobs.industrial) / internalMarketDenom
    projectedCommercialJobs = Math.round(internalMarket * laborBase)

    ###
    Calculate Projected Industrial Jobs
    ###
    projectedIndustrialJobs = Math.round(@jobs.industrial * laborBase * externalMarketMultiplier)
    projectedIndustrialJobs = Math.max(projectedIndustrialJobs, projectedIndJobsMin)

    ###
    Set Demand Ratios of projected to actual
    ###
    residentialRatio = undefined
    commercialRatio = undefined
    industrialRatio = undefined
    if @residents > 0
      residentialRatio = projectedResidents / @residents
    else
      residentialRatio = resRatioDefault
    if @jobs.commercial > 0
      commercialRatio = projectedCommercialJobs / @jobs.commercial
    else
      commercialRatio = projectedCommercialJobs
    if @jobs.industrial > 0
      industrialRatio = projectedIndustrialJobs / @jobs.industrial
    else
      industrialRatio = projectedIndustrialJobs
    residentialRatio = Math.min(residentialRatio, ratioMax)
    commercialRatio = Math.min(commercialRatio, ratioMax)
    industrialRatio = Math.min(industrialRatio, ratioMax)

    # Change the velocity of demand as mediated by the RATIOEFFECT
    # Add 1 just so it never gets totally stuck with a zero multiplier
    @demand.residential += 1 + 30 * (residentialRatio - 1) / ratioEffect # half theeffect of the demand
    @demand.commercial += 1 + 50 * (commercialRatio - 1) / ratioEffect # half the effect of the demand
    @demand.industrial += 1 + 40 * (industrialRatio - 1) / ratioEffect # half the effect of the demand
    @demand.residential = Math.max(-1 * config['MAXDEMAND'], Math.min(config['MAXDEMAND'], @demand.residential))
    @demand.commercial = Math.max(-1 * config['MAXDEMAND'], Math.min(config['MAXDEMAND'], @demand.commercial))
    @demand.industrial = Math.max(-1 * config['MAXDEMAND'], Math.min(config['MAXDEMAND'], @demand.industrial))
    @demand.residential = Math.floor(@demand.residential)
    @demand.commercial = Math.floor(@demand.commercial)
    @demand.industrial = Math.floor(@demand.industrial)

    # return some values for easy debugging/testing
    laborBase: laborBase
    jobsBase: jobsBase
    residentialRatio: residentialRatio
    commercialRatio: commercialRatio
    industrialRatio: industrialRatio
    externalMarketMultiplier: externalMarketMultiplier
    internalMarket: internalMarket
    projectedResidents: projectedResidents
    projectedCommercialJobs: projectedCommercialJobs
    projectedIndustrialJobs: projectedIndustrialJobs
    demandResidential: @demand.residential
    demandCommercial: @demand.commercial
    demandIndustrial: @demand.industrial


  ###
  Scan through all squares in the map and
  call the callback function on each square
  ###
  scanMap: (callback) ->
    y = 0

    while y < @mapsize
      x = 0

      while x < @mapsize
        callback @squares[x][y]
        x++
      y++


  ###
  Returns a list of positions of squares adjacent to the input position
  ###
  adjacentSquares: (position, distance) ->
    squarePositions = []
    if distance is 0
      # North
      squarePositions.push [position[0], position[1] - 1]  if position[1] - 1 > 0
      # East
      squarePositions.push [position[0] + 1, position[1]]  if position[0] + 1 < @mapsize
      # South
      squarePositions.push [position[0], position[1] + 1]  if position[1] + 1 < @mapsize
      # West
      squarePositions.push [position[0] - 1, position[1]]  if position[0] - 1 > 0
    else # distance > 0
      # Starting in the North-West corner, scan adjacent squares
      y = position[1] - distance

      while y <= position[1] + distance
        if (y >= 0) and (y < @mapsize) # not beyond border of map
          x = position[0] - distance

          while x <= position[0] + distance
            # not beyond border of map
            # not the square itself
            squarePositions.push [x, y]  if (x isnt position[0]) or (y isnt position[1])  if (x >= 0) and (x < @mapsize)
            x++
        y++
    squarePositions

  adjacentSquaresCount: (position, distance) ->
    count = {}

    # get the adjacent squares and iterate
    adjacentSquares = @adjacentSquares(position, distance)
    i = 0

    while i < adjacentSquares.length
      position = adjacentSquares[i]
      square = @squares[position[0]][position[1]]
      if count[square.zone] is `undefined`
        count[square.zone] = [square.position]
      else
        count[square.zone].push square.position
      i++
    count

  updateUiMap: ->
    data = map:
      age: @age
      residents: @residents
      jobs: @jobs
      demand: @demand

    @emitter.emit "updateMap", data

  updateUiSquare: (square) ->
    data = square:
      position: square.position
      zone: square.zone
      residents: square.residents
      density: square.density
      jobs: square.jobs
      pollution: square.pollution

    @emitter.emit "updateSquare", data

  rezone: ([x, y], zone) ->
    @squares[x][y].rezone zone


module.exports = Map
