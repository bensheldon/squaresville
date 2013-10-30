Map = require("../../lib/models/map")

describe "Map", ->
  describe 'new', ->
    it "prefilled with squares of the size", ->
      map = new Map(16, {})
      expect(map.squares).to.have.length 16    # rows
      expect(map.squares[0]).to.have.length 16 # columns

  describe "adjacentSquares", ->
    beforeEach ->
      @map = new Map(16, {})

    it "Distance 0: Map Corner", ->
      adjacent = @map.adjacentSquares([0, 0], 0)
      expect(adjacent).to.have.length 2
      expect(adjacent).to.deep.equal [[1, 0], [0, 1]]

    it "Distance 0: Map Edge", ->
      adjacent = @map.adjacentSquares [8, 0], 0
      expect(adjacent).to.have.length 3
      expect(adjacent).to.deep.equal [[9, 0], [8, 1], [7, 0]]

    it "Distance 0: Map Center", ->
      adjacent = @map.adjacentSquares [8, 8], 0
      expect(adjacent).to.have.length 4

    it "Distance 1: Map Corner", ->
      adjacent = @map.adjacentSquares [0, 0], 1
      expect(adjacent).to.have.length 3
      expect(adjacent).to.deep.equal [[1, 0], [0, 1], [1, 1]]

    it "Distance 1: Map Edge", ->
      adjacent = @map.adjacentSquares [8, 0], 1
      expect(adjacent).to.have.length 5
      expect(adjacent).to.deep.equal [[7, 0], [9, 0], [7, 1], [8, 1], [9, 1]]

    it "Distance 1: Map Center", ->
      adjacent = @map.adjacentSquares [8, 8], 1
      expect(adjacent).to.have.length 8

    it "Distance 2: Map Corner", ->
      adjacent = @map.adjacentSquares [0, 0], 2
      expect(adjacent).to.have.length 8

    it "Distance 2: Map Edge", ->
      adjacent = @map.adjacentSquares [8, 0], 2
      expect(adjacent).to.have.length 14

    it "Distance 2: Map Center", ->
      adjacent = @map.adjacentSquares [8, 8], 2
      expect(adjacent).to.have.length 24

# exports.adjacentSquaresCount =
#   setUp: (callback) ->
#     map = new Map.Map(16, {})
#     map.squares[7][0].zone = "residential"
#     map.squares[7][1].zone = "commercial"
#     map.squares[8][0].zone = "road"
#     map.squares[8][1].zone = "road"
#     map.squares[8][2].zone = "road"
#     map.squares[8][3].zone = "road"
#     map.squares[8][4].zone = "road"
#     map.squares[8][5].zone = "road"
#     map.squares[8][6].zone = "road"
#     map.squares[8][7].zone = "road"
#     map.squares[9][4].zone = "commercial"
#     map.squares[9][7].zone = "industrial"
#     @map = map
#     callback() # required!

#   tearDown: (callback) ->
#     delete @map

#     callback() # required!

#   "Count Adjacent Squares": (test) ->
#     map = @map
#     adjacentCount = map.adjacentSquaresCount([7, 0], 1)
#     test.deepEqual adjacentCount,
#       null: [[6, 0], [6, 1]]
#       road: [[8, 0], [8, 1]]
#       commercial: [[7, 1]]

#     test.done()

# exports.globalDemand =
#   setUp: (callback) ->
#     map = new Map.Map(16, {})
#     map.squares[7][0].zone = "residential"
#     map.squares[7][1].zone = "commercial"
#     map.squares[8][0].zone = "road"
#     map.squares[8][1].zone = "road"
#     map.squares[8][2].zone = "road"
#     map.squares[8][3].zone = "road"
#     map.squares[8][4].zone = "road"
#     map.squares[8][5].zone = "road"
#     map.squares[8][6].zone = "road"
#     map.squares[8][7].zone = "road"
#     map.squares[9][4].zone = "commercial"
#     map.squares[9][7].zone = "industrial"
#     @map = map
#     callback() # required!

#   tearDown: (callback) ->
#     delete @map

#     callback() # required!

#   "External Market Multiplier": (test) ->
#     map = @map
#     map.age = 0
#     test.equal map.globalDemand().externalMarketMultiplier, 1.2000000000000002
#     map.age = 50
#     test.equal map.globalDemand().externalMarketMultiplier, 1
#     map.age = 100
#     test.equal map.globalDemand().externalMarketMultiplier, .8
#     test.done()

#   "Projected Populations": (test) ->
#     map = @map
#     map.residents = 110000
#     map.jobs.commercial = 80000
#     map.jobs.industrial = 25000
#     results = map.globalDemand()
#     test.equal results.projectedResidents, 107200
#     test.equal results.projectedCommercialJobs, 60875
#     test.equal results.projectedIndustrialJobs, 31429
#     test.done()

#   "Effect Demand": (test) ->
#     map = @map
#     results = map.globalDemand()
#     test.equal map.demand.residential, 650
#     test.done()
