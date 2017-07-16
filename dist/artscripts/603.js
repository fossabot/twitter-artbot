// Generated by CoffeeScript 1.12.6
(function() {
  var Chance, GenArt, SimplexNoise, _, argv, canvasModule, d3, d3Node, fs, path, run,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs-extra');

  d3 = require('d3');

  _ = require('lodash');

  d3Node = require('d3-node');

  canvasModule = require('canvas-prebuilt');

  Chance = require('chance');

  path = require('path');

  SimplexNoise = require('simplex-noise');

  argv = require('yargs').alias('s', 'seed').argv;

  GenArt = (function() {
    function GenArt(seed) {
      this.tickTil = bind(this.tickTil, this);
      this.tick = bind(this.tick, this);
      this.makeSimulation = bind(this.makeSimulation, this);
      this.makeParticles = bind(this.makeParticles, this);
      this.init = bind(this.init, this);
      var bgColor, d3n, operation;
      console.log('Seed:', seed);
      d3n = new d3Node({
        canvasModule: canvasModule
      });
      this.seed = seed;
      this.chance = new Chance(this.seed);
      this.opacity = 1;
      this.width = 720;
      this.height = 720;
      console.log('width', this.width, 'height', this.height);
      this.text = "Hello world";
      this.count = 100;
      this.numTicks = 9000;
      this.count = this.chance.integer({
        min: 1,
        max: this.count
      });
      this.numTicks = this.chance.integer({
        min: this.numTicks / 2,
        max: this.numTicks
      });
      this.canvas = d3n.createCanvas(this.width, this.height);
      this.ctx = this.canvas.getContext('2d');
      this.clampNum = this.chance.floating({
        min: 2,
        max: 12,
        fixed: 2
      });
      this.simplex = new SimplexNoise();
      bgColor = d3.hsl('#F5DACF');
      this.noiseStep = this.chance.floating({
        min: 0.5,
        max: 8,
        fixed: 2
      });
      this.ctx.fillStyle = bgColor.toString();
      this.ctx.fillRect(0, 0, this.width, this.height);
      if (this.chance.bool({
        likelihood: 15
      })) {
        operation = this.chance.pickone(['multiply', 'difference']);
        this.ctx.globalCompositeOperation = operation;
      }
    }

    GenArt.prototype.init = function(options, callback) {
      if (options == null) {
        options = {};
      }
      this.makeParticles();
      this.makeSimulation();
      this.tickTil(this.numTicks);
      if (options.save) {
        this.saveFile();
      }
      if (callback) {
        return callback();
      }
    };

    GenArt.prototype.makeParticles = function() {
      var colors;
      console.log('Making ' + this.count + ' particles');
      this.text += ' ' + this.count + ' particles';
      colors = ['#FB998C', '#FDC46A', '#749383', '#96B5A3'];
      return this.data = d3.range(this.count).map((function(_this) {
        return function(d, i) {
          var c;
          c = _this.chance.pickone(colors);
          return {
            id: i,
            color: c.toString(),
            vx: 10,
            opacity: _this.opacity,
            radius: _this.chance.integer({
              min: 0.5,
              max: 4
            })
          };
        };
      })(this));
    };

    GenArt.prototype.makeSimulation = function() {
      var centerX, centerY;
      this.simulation = d3.forceSimulation().force('collide', d3.forceCollide((function(_this) {
        return function(d) {
          return d.radius * _this.chance.integer({
            min: 2,
            max: 20
          });
        };
      })(this)));
      if (this.chance.bool({
        likelihood: 85
      })) {
        centerX = this.width / 2;
        centerY = this.height / 2;
        if (this.chance.bool({
          likelihood: 20
        })) {
          centerX += this.chance.integer({
            min: -200,
            max: 200
          });
        }
        if (this.chance.bool({
          likelihood: 20
        })) {
          centerY += this.chance.integer({
            min: -200,
            max: 200
          });
        }
        this.simulation.force('center', d3.forceCenter(centerX, centerY));
      }
      if (this.chance.bool({
        likelihood: 45
      })) {
        this.simulation.force('charge', d3.forceManyBody().distanceMax(this.width / 4).strength(10));
      }
      this.simulation.nodes(this.data);
      return this.simulation.stop();
    };

    GenArt.prototype.tick = function(callback) {
      var clampNum, gvx, gvy, stepValue;
      this.ticks++;
      this.simulation.tick();
      this.simulation.tick();
      if (this.chance.bool()) {
        this.simulation.alpha(0.8);
      }
      gvy = this.chance.floating();
      gvx = this.chance.floating();
      stepValue = this.chance.floating({
        min: 0.8,
        max: 1.6
      });
      clampNum = this.clampNum;
      return this.data.forEach((function(_this) {
        return function(d, i) {
          var c, noiseValue;
          noiseValue = _this.simplex.noise2D(d.x, d.y);
          d.radius *= noiseValue / 2;
          d.x = _.clamp(d.x, 0, _this.width);
          d.y = _.clamp(d.y, 0, _this.height);
          d.radius = _.clamp(d.radius, 1, 90);
          c = d3.hsl(d.color);
          c.opacity = d.opacity;
          d.color = c.toString();
          _this.ctx.beginPath();
          _this.ctx.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
          _this.ctx.closePath();
          _this.ctx.fillStyle = d.color;
          _this.ctx.fill();
          if (callback) {
            return callback;
          }
        };
      })(this));
    };

    GenArt.prototype.tickTil = function(count) {
      var i, j, ref;
      console.log('Ticking ' + this.data.length + ' particles ' + count + ' times');
      console.time('ticked for');
      i = 0;
      for (j = 0, ref = count; 0 <= ref ? j <= ref : j >= ref; 0 <= ref ? j++ : j--) {
        i++;
        this.tick();
      }
      return console.timeEnd('ticked for');
    };

    GenArt.prototype.saveFile = function(filename) {
      var fileOutput, pngFile, stream;
      if (!filename) {
        filename = path.basename(__filename, '.js') + '-' + this.seed;
      }
      fileOutput = './dist/' + filename + '.png';
      pngFile = fs.createWriteStream(fileOutput);
      stream = this.canvas.pngStream();
      stream.on('data', function(chunk) {
        return pngFile.write(chunk);
      });
      return stream.on('end', function() {
        return console.log('canvas saved --> ' + fileOutput);
      });
    };

    return GenArt;

  })();

  run = function() {
    var genart, seed;
    if (argv.seed) {
      seed = argv.seed;
    } else {
      seed = Date.now();
    }
    genart = new GenArt(seed);
    if (argv.count) {
      genart.count = argv.count;
    }
    if (argv.ticks) {
      genart.numTicks = argv.ticks;
    }
    return genart.init({
      save: true
    });
  };

  module.exports = GenArt;

  if (require.main === module) {
    run();
  }

}).call(this);