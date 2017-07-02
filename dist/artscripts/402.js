// Generated by CoffeeScript 1.12.6
(function() {
  var Chance, GenArt, _, argv, canvasModule, d3, d3Node, fs, path, run,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  d3 = require('d3');

  _ = require('lodash');

  d3Node = require('d3-node');

  canvasModule = require('canvas-prebuilt');

  Chance = require('chance');

  path = require('path');

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
      this.opacity = 0.6;
      this.width = 1200;
      this.height = 1200;
      console.log('width', this.width, 'height', this.height);
      this.count = 66;
      this.numTicks = 6666;
      this.count = this.chance.integer({
        min: 1,
        max: this.count
      });
      this.numTicks = this.chance.integer({
        min: 666,
        max: this.numTicks
      });
      this.canvas = d3n.createCanvas(this.width, this.height);
      this.ctx = this.canvas.getContext('2d');
      this.ctx.fillStyle = '#DBE2CE';
      this.ctx.fillRect(0, 0, this.width, this.height);
      if (this.chance.bool({
        likelihood: 95
      })) {
        this.ctx.globalCompositeOperation = 'multiply';
      }
    }

    GenArt.prototype.init = function(options, callback) {
      if (options == null) {
        options = {};
      }
      this.makeParticles();
      this.tickTil(this.numTicks);
      if (options.save) {
        this.saveFile();
      }
      if (callback) {
        return callback();
      }
    };

    GenArt.prototype.makeParticles = function() {
      var color, colors;
      console.log('Making ' + this.count + ' particles');
      colors = ['#FA9921', '#FF0D5D'];
      color = this.chance.pickone(colors);
      return this.data = d3.range(this.count).map((function(_this) {
        return function(d, i) {
          var c, halfWidth, x, y;
          halfWidth = _this.width / 2;
          x = halfWidth + _this.chance.integer({
            min: -halfWidth,
            max: halfWidth
          });
          y = _this.chance.integer({
            min: 0,
            max: 40
          });
          c = d3.hsl(color);
          return {
            radius: 1,
            x: x,
            y: y,
            color: c.toString(),
            vx: 0,
            vy: 0,
            dead: false
          };
        };
      })(this));
    };

    GenArt.prototype.tick = function() {
      var gvx, gvy;
      this.ticks++;
      gvy = this.chance.integer({
        min: -2,
        max: 3
      });
      gvx = this.chance.integer({
        min: -3,
        max: 3
      });
      return this.data.forEach((function(_this) {
        return function(d, i) {
          var c;
          d.vy = gvy + d.vy + _this.chance.floating({
            min: -4,
            max: 4.5,
            fixed: 2
          });
          d.vy = _.clamp(d.vy, -4, 4);
          d.vx = gvx + d.vx + _this.chance.floating({
            min: -4,
            max: 4,
            fixed: 2
          });
          d.vx = _.clamp(d.vx, -4, 4);
          if (_this.chance.bool({
            likelihood: i * 0.001
          })) {
            d.radius += 0.1;
          }
          if (_this.chance.bool({
            likelihood: i * 0.01
          })) {
            if (d.y > _this.height / 2) {
              d.vy--;
            }
          }
          d.y = d.y + (d.vy / 4);
          d.x = d.x + (d.vx / 4);
          c = d3.hsl(d.color);
          c.opacity = _this.opacity;
          d.color = c.toString();
          if (!d.dead) {
            _this.ctx.beginPath();
            _this.ctx.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
            _this.ctx.closePath();
            _this.ctx.fillStyle = d.color;
            return _this.ctx.fill();
          }
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
