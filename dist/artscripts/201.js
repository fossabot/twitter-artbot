// Generated by CoffeeScript 1.12.6
(function() {
  var Chance, GenArt, _, argv, canvasModule, colorLovers, d3, d3Node, fs, path, run,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  d3 = require('d3');

  _ = require('lodash');

  d3Node = require('d3-node');

  canvasModule = require('canvas-prebuilt');

  Chance = require('chance');

  path = require('path');

  colorLovers = require('colourlovers');

  argv = require('yargs').alias('s', 'seed').argv;

  GenArt = (function() {
    function GenArt(seed) {
      this.tick = bind(this.tick, this);
      this.makeParticles = bind(this.makeParticles, this);
      this.init = bind(this.init, this);
      var d3n;
      console.log('Seed:', seed);
      d3n = new d3Node({
        canvasModule: canvasModule
      });
      this.seed = seed;
      this.chance = new Chance(this.seed);
      this.count = 8;
      this.numTicks = 2500;
      this.count = this.chance.integer({
        min: 1,
        max: this.count
      });
      this.numTicks = this.chance.integer({
        min: 1,
        max: this.numTicks
      });
      this.width = 1700;
      this.height = 1250;
      console.log('width', this.width, 'height', this.height);
      this.canvas = d3n.createCanvas(this.width, this.height);
      this.ctx = this.canvas.getContext('2d');
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    GenArt.prototype.init = function(options, callback) {
      if (options == null) {
        options = {};
      }
      return colorLovers.get('/palettes', {
        keywords: this.chance.pickone(['grey', 'dreary', 'newyork', 'vintage', 'fog', 'subtle'], {
          sortBy: 'DESC',
          numResults: 1,
          orderCol: this.chance.pickone(['dateCreated', 'score', 'name', 'numVotes', 'numViews'])
        })
      }, (function(_this) {
        return function(err, data) {
          var colors, rndColor;
          rndColor = _this.chance.integer({
            min: 1,
            max: data.length
          });
          colors = data[rndColor].colors;
          colors = colors.map(function(c) {
            return '#' + c;
          });
          if (_this.chance.bool({
            likelihood: 75
          })) {
            _this.ctx.fillStyle = colors[0];
            _this.ctx.fillRect(0, 0, _this.width, _this.height);
          }
          if (_this.chance.bool({
            likelihood: 10
          })) {
            _this.ctx.fillStyle = '#000';
            _this.ctx.fillRect(0, 0, _this.width, _this.height);
          }
          console.log('colors ->', colors);
          if (!err) {
            _this.c10 = d3.scaleOrdinal().range(colors);
          } else {
            _this.c10 = d3.scaleOrdinal().range(['#FFF', '#000', 'red']);
          }
          _this.makeParticles();
          _this.tickTil(_this.numTicks);
          if (options.save) {
            _this.saveFile();
          }
          if (callback) {
            return callback();
          }
        };
      })(this));
    };

    GenArt.prototype.makeParticles = function() {
      console.log('Making ' + this.count + ' particles');
      this.data = d3.range(this.count).map((function(_this) {
        return function() {
          var direction, prclColor, x, y;
          x = _this.width / 2;
          y = _this.chance.integer({
            min: 0,
            max: _this.height
          });
          direction = _this.chance.pickone(['up', 'down', 'left', 'right']);
          prclColor = _this.c10(direction);
          return {
            x: x,
            y: y,
            color: prclColor,
            direction: direction,
            positions: [],
            radius: _this.width / 4
          };
        };
      })(this));
      return this.data;
    };

    GenArt.prototype.tick = function() {
      var ticks;
      if (!this.ticks) {
        ticks = 0;
      }
      this.ticks++;
      return this.data.forEach((function(_this) {
        return function(d, i) {
          var c, dLikelies, moveUnit, randOffset;
          randOffset = 10;
          d.radius = d.radius - 2;
          d.radius = _.clamp(d.radius, 0, _this.width / _this.count);
          dLikelies = d3.range(2).map(function() {
            return _this.chance.integer({
              min: 0,
              max: 80
            });
          });
          moveUnit = _this.width / 50;
          if (_this.chance.bool({
            likelihood: _.clamp(dLikelies[0] + 50, 0, 100)
          })) {
            d.y += moveUnit;
          }
          if (_this.chance.bool({
            likelihood: _.clamp(dLikelies[1] + 50, 0, 100)
          })) {
            d.y -= moveUnit;
          }
          if (_this.chance.bool({
            likelihood: 5
          })) {
            c = d3.hsl(d.color);
            c.h += _this.chance.integer({
              min: -20,
              max: 20
            });
            d.color = c.toString();
          }
          _this.ctx.beginPath();
          _this.ctx.moveTo(d.x, d.y);
          _this.ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2, true);
          _this.ctx.fillStyle = d.color;
          return _this.ctx.fill();
        };
      })(this));
    };

    GenArt.prototype.tickTil = function(count) {
      var j, ref;
      console.log('Ticking ' + this.data.length + ' particles ' + count + ' times');
      console.time('ticked for');
      for (j = 0, ref = count; 0 <= ref ? j <= ref : j >= ref; 0 <= ref ? j++ : j--) {
        this.tick();
      }
      return console.timeEnd('ticked for');
    };

    GenArt.prototype.saveFile = function(filename) {
      var fileOutput;
      if (!filename) {
        filename = path.basename(__filename, '.js') + '-' + this.seed;
      }
      fileOutput = './dist/' + filename + '.png';
      console.log('canvas output --> ' + fileOutput);
      return this.canvas.pngStream().pipe(fs.createWriteStream(fileOutput));
    };

    return GenArt;

  })();

  run = (function(_this) {
    return function() {
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
  })(this);

  module.exports = GenArt;

  if (require.main === module) {
    run();
  }

}).call(this);
