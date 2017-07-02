fs = require 'fs'
d3 = require 'd3'
_ = require 'lodash'
d3Node = require 'd3-node'
canvasModule = require 'canvas-prebuilt'
Chance = require 'chance'
path = require 'path'
colorLovers = require 'colourlovers'
argv = require 'yargs'
  .alias 's', 'seed'
  .argv

class GenArt
  constructor: (seed) ->
    console.log('Seed:', seed)
    d3n = new d3Node { canvasModule }
    @seed = seed # The seed for the art

    @chance = new Chance(@seed) # init chance.js - chancejs.com
    @count = 2500 # Max number of particles to create
    @numTicks = 1800 # Max number of times to tick over those particles

    # Randomize count/ticks based on maxes we just set
    @count = @chance.integer({min: 1, max: @count})
    @numTicks = @chance.integer({min: 1, max: @numTicks})

    # Canvas width and height
    @width = 1700
    @height = 1250
    if @chance.bool()
      @width = 900
      @width = 900
    console.log 'width', @width, 'height', @height


    # Create the canvas with D3 Node
    @canvas = d3n.createCanvas @width, @height
    @ctx = @canvas.getContext '2d'

    if @chance.bool()
      @ctx.globalCompositeOperation = 'multiply'
      @tickOpacity = @chance.integer({min:7.5, max: 10}) * 0.1
    else
      @tickOpacity = 1

    # make bg
    @bgColor = 'white'
    @ctx.fillStyle = @bgColor
    @ctx.fillRect(0, 0, @width, @height);

  init: (options = {}, callback) =>
    colorLovers.get('/palettes', {
        keywords: @chance.pickone ['dark', 'minimal', 'subtle', 'pop', 'shiny'],
        sortBy: 'DESC',
        numResults: 1
        orderCol: @chance.pickone(['dateCreated', 'score', 'numVotes', 'numViews'])
    },(err, data) =>
      if(err)
        console.log err
      # console.log('data ->', data)

      rndColor = @chance.integer({min: 1, max: data.length})
      if data[0].colors
        colors = data[rndColor].colors
      else
        colors = ['000', '1f73d6', '60042d']
      colors = colors.map (c) -> '#'+c

      @bgColor = '#FFF'

      console.log 'colors ->', colors

      @c10 = d3.scaleOrdinal()
        .range(colors)

      @makeParticles()
      @tickTil(@numTicks)
      if options.save
        @saveFile()

      if callback
        callback()
    )


  makeParticles: =>
    console.log('Making ' + @count + ' particles')
    i = 0
    @data = d3.range(@count).map =>
      i++
      # x = @chance.integer({min: 0, max: @width})
      # y = @chance.integer({min: 0, max: @height})
      x = @width / 2
      y = @height / 2

      # c = d3.hsl('red')
      # c.h += @chance.natural({min: 0, max: 14})

      # @c10 = d3.scaleOrdinal()
      #   .range(["#FF0000", "#009933" , "#0000FF"]);

      direction = @chance.pickone(['up', 'down', 'left', 'right'])

      prclColor = @c10(direction)

      {
        x: @chance.pickone([0, @width, (@width/2)])
        y: @chance.pickone([0, @height, (@height/2)])
        color: @c10(i % 3)
        direction: direction
        positions: []
        radius: 2
        stroke: false
      }
    return @data

  tick: =>
    if !@ticks
      ticks = 0
    @ticks++
    #console.log(@ticks, 'Ticking on ' + @data.length + ' particles')
    @data.forEach((d,i) =>
      randOffset = 1

      dLikelies = d3.range(8).map =>
        @chance.integer {min: 10, max: 50}

      if d.stroke
        moveUnit = 1
      else
        moveUnit = @chance.integer({min: 1, max: 5})

      if d.direction is 'up'
        if d.y <= 0
          d.y = 0
        if @chance.bool({likelihood: _.clamp(dLikelies[0] + 50, 0, 100)})
          d.y += moveUnit
        if @chance.bool({likelihood: dLikelies[0]})
          d.x -= randOffset
        if @chance.bool({likelihood: dLikelies[1]})
          d.x += randOffset
      else if d.direction is 'down'
        if d.y >= @height
          d.y = 0
        if @chance.bool({likelihood: _.clamp(dLikelies[0] + 50, 0, 100)})
          d.y -= moveUnit
        if @chance.bool({likelihood: dLikelies[2]})
          d.x -= randOffset
        if @chance.bool({likelihood: dLikelies[3]})
          d.x += randOffset
      else if d.direction is 'left'
        if d.y <= 0
          d.y = @width
        if @chance.bool({likelihood: _.clamp(dLikelies[0] + 50, 0, 100)})
          d.x -= moveUnit
        if @chance.bool({likelihood: dLikelies[4]})
          d.y -= moveUnit
        if @chance.bool({likelihood: dLikelies[5]})
          d.y += moveUnit
      else if d.direction is 'right'
        if d.y >= @width
          d.y = 0
        if @chance.bool({likelihood: _.clamp(dLikelies[0] + 50, 0, 100)})
          d.x += moveUnit
        if @chance.bool({likelihood: dLikelies[6]})
          d.y -= moveUnit
        if @chance.bool({likelihood: dLikelies[7]})
          d.y += moveUnit

      if @chance.bool({likelihood: 10})
        d.direction = @chance.pickone ['up', 'down', 'left', 'right']

      if @chance.bool({likelihood: 1})
        d.x = @chance.integer {min: 0, max: @width}
        d.y = @chance.integer {min: 0, max: @height}

      # if @chance.bool()
      #   d.color = @c10 d.direction

      if @chance.bool({likelihood: 2})
        c = d3.hsl d.color
        c.h += @chance.integer({min: -2, max: 2})
        # if @chance.bool {likelihood: 15}
        #   c.s += @chance.integer({min: -45, max: 45})
        d.color = c.toString()

      # console.log 'x', d.x, 'y', d.y
      # @ctx.beginPath()
      # @ctx.rect d.x, d.y, 2, 2
      #
      # @ctx.closePath()

      # if d.radius <= 0
      #   d.radius = 2


      @ctx.beginPath()
      #@ctx.moveTo(d.x, d.y)
      if @chance.bool {likelihood: 0.1}
        @ctx.arc(d.y, d.x, 100, 0, Math.PI * 2, true)
      else
        @ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2, true)

      if d.stroke is true
        @ctx.fillStyle = 'none'
        @ctx.strokeStyle = d.color
        @ctx.stroke()
      else
        c = d3.hsl d.color
        c.opacity = @tickOpacity
        d.color = c.toString()
        @ctx.fillStyle = d.color
        @ctx.fill()
        # if @chance.bool { likelihood: 10}
        #   @ctx.strokeStyle = @bgColor
        #   @ctx.stroke()

    )

  tickTil: (count) ->
    console.log 'Ticking ' + @data.length + ' particles ' + count + ' times'

    console.time('ticked for')
    for [0..count]
      @tick()
    console.timeEnd('ticked for')

  saveFile: (filename) ->
    if !filename
      filename = path.basename(__filename, '.js') + '-' + @seed
    fileOutput = './dist/' + filename + '.png'
    console.log('canvas output --> ' + fileOutput);

    # Save image locally to /dist/
    @canvas.pngStream().pipe(fs.createWriteStream(fileOutput))

run = =>
  # If this is being called from the command line

  # --seed foo
  # would set the seed to "foo"
  if argv.seed
    seed = argv.seed
  else
    seed = Date.now()
  genart = new GenArt(seed)

  # --count 100
  # would make 100 particles
  if argv.count
    genart.count = argv.count

  # --ticks 10
  # would make it tick 10 times
  if argv.ticks
    genart.numTicks = argv.ticks

  genart.init({save: true})

module.exports = GenArt
if(require.main == module)
  run()
