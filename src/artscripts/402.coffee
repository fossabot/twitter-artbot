fs = require 'fs'
d3 = require 'd3'
_ = require 'lodash'
d3Node = require 'd3-node'
canvasModule = require 'canvas-prebuilt'
Chance = require 'chance'
path = require 'path'
argv = require 'yargs'
  .alias 's', 'seed'
  .argv

class GenArt
  constructor: (seed) ->
    console.log('Seed:', seed)
    d3n = new d3Node { canvasModule }
    @seed = seed # The seed for the art

    @chance = new Chance(@seed) # init chance.js - chancejs.com
    # @numTicks = 9000 # Max number of times to tick over those particles

    @opacity = 0.6

    # Canvas width and height
    @width = 1200
    @height = 1200
    console.log 'width', @width, 'height', @height

    @count = 66
    @numTicks = 6666

    @count = @chance.integer({min: 1, max: @count})
    @numTicks = @chance.integer({min: 666, max: @numTicks})

    # Create the canvas with D3 Node
    @canvas = d3n.createCanvas @width, @height
    @ctx = @canvas.getContext '2d'

    # make bg
    @ctx.fillStyle = '#DBE2CE'
    @ctx.fillRect(0, 0, @width, @height)

    if @chance.bool { likelihood: 95 }
      @ctx.globalCompositeOperation = 'multiply'

  init: (options = {}, callback) =>
    @makeParticles()
    @tickTil(@numTicks)

    if options.save
      @saveFile()

    if callback
      callback()

  makeParticles: =>
    console.log('Making ' + @count + ' particles')

    colors = ['#FA9921', '#FF0D5D']
    color = @chance.pickone colors

    @data = d3.range(@count).map (d,i) =>

      halfWidth = @width / 2
      x = halfWidth + @chance.integer {min: -halfWidth, max: halfWidth}
      #y = @height / 2
      y = @chance.integer {min: 0, max: 40}
      c = d3.hsl(color)

      {
        radius: 1
        x: x
        y: y
        color: c.toString()
        # color: 'black'
        vx: 0
        vy: 0
        dead: false
      }

  tick: =>
    @ticks++

    gvy = @chance.integer {min: -2, max: 3}
    gvx = @chance.integer {min: -3, max: 3}

    @data.forEach((d,i) =>
      d.vy = gvy + d.vy + @chance.floating {min: -4, max: 4.5, fixed: 2}
      d.vy = _.clamp(d.vy, -4, 4)
      d.vx = gvx + d.vx + @chance.floating {min: -4, max: 4, fixed: 2}
      d.vx = _.clamp(d.vx, -4, 4)

      if @chance.bool { likelihood: (i * 0.001) }
        d.radius += 0.1

      if @chance.bool { likelihood: (i * 0.01) }
        if d.y > @height / 2
          d.vy--

      d.y = d.y + (d.vy / 4)
      # d.y += @chance.integer {min: -1, max: 1}
      d.x = d.x + (d.vx / 4)
      # d.x += @chance.integer {min: -1, max: 1}

      c = d3.hsl d.color
      # c.h += @chance.natural({min: 0, max: 90})
      c.opacity = @opacity
      d.color = c.toString()


      if !d.dead
        @ctx.beginPath()
        @ctx.arc(d.x, d.y, d.radius, 0, 2*Math.PI)
        @ctx.closePath()
        @ctx.fillStyle = d.color
        @ctx.fill()
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