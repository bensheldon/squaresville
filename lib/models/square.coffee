_ = require("underscore")

config = require("../config")
Travel = require("./travel")

class Square

  constructor: (map, position) ->
    @position = [position[0], position[1]]
    @zone = null # type of zone
    @residents = 0 # how many people live here (0 <> 1000)
    @jobs = 0 # how many people can be employed here (0 <> 600)
    @growthRate = 0 # how quickly are residents/jobs increasing (-200 <> 200)
    @landValue = 0 # what is the perceived value of this square (0 <> 500,000)
    @transit = false # can other zones be reached (true | false)
    @pollution = 0 # level of pollution (0 <> 5)
    @polluter = false # the zone produces pollution (true | false)
    @density = 0 # how jammed together is the zone (0 <> 5)
    @_map = map # the map the square is a part of

  rezone: (zone) ->
    @_map.residents -= @residents
    @zone = zone
    @residents = 0
    @jobs = 0
    @density = 0
    @transit = false
    @_map.updateUiSquare this

  doZone: ->
    switch @zone
      when "residential"
        @doResidential()
      when "commercial"
        @doCommercial()
      when "industrial"
        @doIndustrial()

  doResidential: ->
    growResidents = 0
    if (@_map.demand.residential > 0) and (@transit is true)

      # if population is zero
      if @residents is 0
        growResidents = 1 # default growth;
      else # (this.residents > 0)
        growResidents = @residents * (@_map.demand.residential / 100)
        growResidents = Math.ceil(growResidents * ((5 - @pollution) / 5))
    else
      if @residents is 0
        @growthRate = 0
        @residents = 0
      else # (this.residents > 0)
        if @transit is true

          # globalDemand is now negative
          growResidents = 0.3 * @residents * (@_map.demand.residential / 100)

          # pollution should accelerate the negative growth, here it accelerates to twice
          growResidents = Math.ceil(growResidents * (1 + @pollution / 10))
        else # (this.transit == false)
          # globalDemand but no transit connection
          growResidents = -0.10 * @residents
    growResidents = @tryResidentialBuild(growResidents)

    # calculate growthRate
    if @residents > 0
      @growthRate = Math.round((growResidents / @residents) * 100)
    else
      if growResidents > 0
        @growthRate = 100
      else
        @growthRate = 0

    # and finally add them to the square and map
    @residents += growResidents
    @_map.residents += growResidents

  doCommercial: ->
    newJobs = 0
    if (@_map.demand.commercial > 0) and (@transit is true)

      # if current jobs is zero
      if @jobs is 0
        newJobs = 1 # default growth;
      else # (this.jobs > 0)
        newJobs = Math.ceil(@jobs * (@_map.demand.commercial / 100))
    else
      if @jobs is 0
        newJobs = 0
      else # (this.jobs > 0)
        if @transit is true

          # Demand is now negative
          newJobs = Math.ceil(0.3 * @jobs * (@_map.demand.commercial / 100))
        else # (this.transit == false)
          # Demand but no transit connection
          newJobs = -0.10 * @jobs

    # Try to build out a larger building/larger density
    newJobs = @tryCommercialBuild(newJobs)

    # calculate growthRate
    if @jobs > 0
      @growthRate = Math.round((newJobs / @jobs) * 100)
    else
      if newJobs > 0
        @growthRate = 100
      else
        @growthRate = 0

    # and finally add them to the square and map
    @jobs += newJobs
    @_map.jobs.commercial += newJobs

  doIndustrial: ->
    newJobs = 0
    if (@_map.demand.industrial > 0) and (@transit is true)

      # if population is zero
      if @jobs is 0
        newJobs = 1 # default growth;
      else # (this.jobs > 0)
        newJobs = Math.ceil(@jobs * (@_map.demand.industrial / 100))
    else
      if @jobs is 0
        newJobs = 0
      else # (this.jobs > 0)
        if @transit is true

          # Demand is now negative
          newJobs = Math.ceil(0.3 * @jobs * (@_map.demand.industrial / 100))
        else # (this.transit == false)
          # Demand but no transit connection
          newJobs = -0.10 * @jobs

    # Try to build out a larger building/larger density
    newJobs = @tryIndustrialBuild(newJobs)

    # calculate growthRate
    if @jobs > 0
      @growthRate = Math.round((newJobs / @jobs) * 100)
    else
      if newJobs > 0
        @growthRate = 100
      else
        @growthRate = 0

    # and finally add them to the square and map
    @jobs += newJobs
    @_map.jobs.industrial += newJobs

  tryResidentialBuild: (newResidents) ->
    max = [0, 10, 55, 280]
    switch @density
      when 0
        if newResidents
          @density = 1
          @_map.updateUiSquare this
      when 1
        if (@residents + newResidents) > max[1]

          # determine if there is enough global size to grow
          if @_map.residents > 100
            @density = 2
            @_map.updateUiSquare this
          else # not ready to grow yet
            newResidents = max[1] - @residents # max out the size
      when 2
        if (@residents + newResidents) > max[2]
          if @_map.residents > 1500
            @density = 2
            @_map.updateUiSquare this
        else
          newResidents = max[2] - @residents # max out the size
      when 3
        newResidents = max[3] - @residents  if (@residents + newResidents) > max[3] # max out the size
    newResidents

  tryCommercialBuild: (newJobs) ->
    commercialBase = 6

    # The residential Capacity of building are 1, 6, 36, 216
    if (@jobs + newJobs) <= Math.pow(commercialBase, @density)
      if @density < 3
        @density += 1
        @_map.updateUiSquare this
    else

      # No more room to grow
      newJobs = 0
    newJobs

  tryIndustrialBuild: (newJobs) ->
    industrialBase = 9

    # The residential Capacity of building are 1, 9, 81, 729
    if (@jobs + newJobs) <= Math.pow(industrialBase, @density)
      if @density < 3
        @density += 1
        @_map.updateUiSquare this
    else

      # No more room to grow
      newJobs = 0
    newJobs

  doTransit: ->
    switch @zone
      when "residential"
        indTrip = Travel(@_map, @position, "commercial")
        comTrip = Travel(@_map, @position, "industrial")
        if indTrip and comTrip
          @transit = true
        else if indTrip and (@_map.residents < 100)
          # if less than 100 residents, we'll ignore commercial
          @transit = true
        else
          @transit = false
      when "commercial"
        resTrip = new Travel(@_map, @position, "residential")
        indTrip = new Travel(@_map, @position, "industrial")
        if resTrip and indTrip
          @transit = true
        else
          @transit = false
      when "industrial"
        resTrip = new Travel(@_map, @position, "residential")
        if resTrip
          @transit = true
        else
          @transit = false

module.exports = Square
