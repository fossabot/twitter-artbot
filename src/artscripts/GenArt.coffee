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
    @seed = seed # The seed for the art

    @chance = new Chance(@seed) # init chance.js - chancejs.com
    @count = 65 # Max number of particles to create
    @numTicks = 16 # Max number of times to tick over those particles

    @opacity = 1

    @text = @seed

    # Randomize count/ticks based on maxes we just set
    @count = @chance.integer({min: 1, max: @count})
    @numTicks = @chance.integer({min: 1, max: @numTicks})

    # Canvas width and height
    @width = 1080
    @height = 720

    @bgColor = 'black'

  makeCanvas: ->
    # Create the canvas with D3 Node
    d3n = new d3Node { canvasModule }
    @canvas = d3n.createCanvas @width, @height
    @ctx = @canvas.getContext '2d'

    # make bg
    @ctx.fillStyle = @bgColor
    @ctx.fillRect(0, 0, @width, @height)

  init: (options = {}, callback) =>
    console.log('Seed:', @seed)
    console.log 'width', @width, 'height', @height
    @makeCanvas()
    @makeParticles()
    @tickTil(@numTicks)

    if options.save
      @saveFile()

    if callback
      callback()


  makeParticles: =>
    console.log('Making ' + @count + ' particles')
    @data = d3.range(@count).map =>
      offsetAmount = 250
      offset = {}
      offset.x = @chance.floating({min: -offsetAmount, max: offsetAmount})
      offset.y = @chance.floating({min: -offsetAmount, max: offsetAmount})
      x = (@width / 2 ) + offset.x
      y = (@height / 2 ) + offset.y

      c = d3.hsl('white')
      # c.h += @chance.natural({min: 0, max: 14})
      c.opacity = @opacity

      {
        x: x
        y: y
        color: c.toString()
      }
    return @data

  tick: =>
    if !@ticks
      ticks = 0
    @ticks++
    #console.log(@ticks, 'Ticking on ' + @data.length + ' particles')
    @data.forEach((d,i) =>
      # Modify the data

      if @chance.bool {likelihood: 50}
        d.x += @chance.floating {min: -8, max: 8}

      if @chance.bool {likelihood: 50}
        d.y += @chance.floating {min: -8, max: 8}

      # Paint the data
      @ctx.beginPath()
      @ctx.rect d.x, d.y, 2, 2
      @ctx.fillStyle = d.color
      @ctx.fill()
      @ctx.closePath()
    )

  tickTil: (count) ->
    console.log 'Ticking ' + @data.length + ' particles ' + count + ' times'
    console.time('Ticked for')
    for [0..count]
      @tick()
    console.timeEnd('Ticked for')

  saveFile: (filename, callback) ->
    # console.log 'callback: ', callback
    if !filename and !@filename
      filename = path.basename(__filename, '.js') + '-' + @seed
    else if @filename
      filename = @filename
      
    fileOutput = './dist/' + filename + '.png'
    file = fs.createWriteStream(fileOutput)

    # Save image locally to /dist/
    stream = @canvas.pngStream().pipe(file)

    stream.on 'finish', ->
      # console.log 'write stream finished'
      console.log('canvas output --> ' + fileOutput)
      if callback
        callback()

run = ->
  console.log ' -- run'
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

if(require.main == module)
  console.log 'Running as module'
  run()

module.exports = GenArt
