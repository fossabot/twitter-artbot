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
      this.logSettings = bind(this.logSettings, this);
      this.init = bind(this.init, this);
      var d3n;
      console.log('Seed:', seed);
      d3n = new d3Node({
        canvasModule: canvasModule
      });
      this.seed = seed;
      this.chance = new Chance(this.seed);
      this.opacity = this.chance.floating({
        min: 0.01,
        max: 0.5,
        fixed: 2
      });
      this.width = 1200;
      this.height = 720;
      console.log('width', this.width, 'height', this.height);
      this.text = "Hello world";
      this.count = 100;
      this.numTicks = 9000;
      this.colors = ['#B0E1F0', '#FDADD1', '#FFFFBC', '#A5DDC2', '#D7D9F8', '#F09BC1', '#E6FFE6', '#C2CDC5', '#BE497E', '#19426E', '#BFE5FF', '#A5DDC2', '#FAA21F', '#CB3F24'];
      this.hueChange = this.chance.bool();
      this.sizeChange = this.chance.bool();
      this.multiColor = this.chance.bool({
        chance: 2
      });
      this.clampBorders = this.chance.bool();
      this.useLinks = this.chance.bool();
      this.oneLinkTarget = this.chance.bool();
      this.count = this.chance.integer({
        min: 1,
        max: this.count
      });
      this.linkCount = this.chance.integer({
        min: 1,
        max: this.count / 2
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
      this.bgColor = d3.hsl(this.chance.pickone(this.colors));
      this.ctx.fillStyle = this.bgColor.toString();
      this.ctx.fillRect(0, 0, this.width, this.height);
      if (this.chance.bool({
        likelihood: 90
      })) {
        this.ctx.globalCompositeOperation = 'multiply';
      } else {
        if (this.chance.bool({
          likelihood: 2
        })) {
          this.ctx.globalCompositeOperation = 'difference';
        }
      }
    }

    GenArt.prototype.init = function(options, callback) {
      if (options == null) {
        options = {};
      }
      this.logSettings();
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

    GenArt.prototype.logSettings = function() {
      console.log('Colors: ', JSON.stringify(this.colors));
      console.log('One Link Target:', this.oneLinkTarget);
      console.log('BG Color: ', this.bgColor.toString());
      console.log('Links: ', this.useLinks);
      console.log('Hue change: ', this.hueChange);
      console.log('Size change: ', this.sizeChange);
      return console.log('Multicolor: ', this.multiColor);
    };

    GenArt.prototype.makeParticles = function() {
      var c, linkTarget;
      console.log('Making ' + this.count + ' particles');
      this.text += ' ' + this.count + ' particles';
      c = this.chance.pickone(this.colors);
      this.data = d3.range(this.count).map((function(_this) {
        return function(d, i) {
          if (_this.multiColor) {
            c = _this.chance.pickone(_this.colors);
          }
          return {
            index: i,
            id: i,
            color: c.toString(),
            opacity: _this.opacity,
            radius: _this.chance.integer({
              min: 1,
              max: 6
            })
          };
        };
      })(this));
      console.log('Making ' + this.linkCount + ' links');
      linkTarget = this.chance.integer({
        min: 1,
        max: this.count - 1
      });
      return this.links = d3.range(this.linkCount).map((function(_this) {
        return function(d, i) {
          var linkSource;
          linkSource = _this.chance.integer({
            min: 1,
            max: _this.count - 1
          });
          if (!_this.oneLinkTarget) {
            linkTarget = _this.chance.integer({
              min: 1,
              max: _this.count - 1
            });
          }
          return {
            source: linkSource,
            target: linkTarget
          };
        };
      })(this));
    };

    GenArt.prototype.makeSimulation = function() {
      var alphaDecay, collideMult, collideStrength, manyBodyStrength;
      collideMult = this.chance.integer({
        min: 1,
        max: 8
      });
      alphaDecay = this.chance.floating({
        min: 0.00001,
        max: 0.01,
        fixed: 6
      });
      collideStrength = this.chance.floating({
        min: 0.01,
        max: 0.99,
        fixed: 3
      });
      manyBodyStrength = this.chance.floating({
        min: -60,
        max: 10,
        fixed: 3
      });
      this.simulation = d3.forceSimulation().nodes(this.data).alphaDecay(alphaDecay).force('collide', d3.forceCollide(function(d) {
        return d.radius * collideMult;
      }).strength(collideStrength)).force('center', d3.forceCenter(this.width / 2, this.height / 2)).force('charge', d3.forceManyBody().strength(manyBodyStrength)).force('links', d3.forceLink(this.links).distance((function(_this) {
        return function() {
          return _this.chance.integer({
            min: 10,
            max: _this.width
          });
        };
      })(this)));
      return this.simulation.stop();
    };

    GenArt.prototype.tick = function(callback) {
      var clampNum, gvx, gvy, stepValue;
      this.ticks++;
      this.simulation.tick();
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
          if (d.y >= _this.height) {
            d.dead = true;
          }
          if (d.x >= _this.width) {
            d.dead = true;
          }
          noiseValue = _this.simplex.noise2D(d.x, d.y);
          if (_this.chance.bool()) {
            if (_this.chance.bool()) {
              d.vx += noiseValue * 2;
            }
            if (_this.chance.bool()) {
              d.vy += noiseValue * 2;
            }
          }
          if (_this.sizeChange) {
            d.radius += noiseValue / 2;
          }
          if (_this.clampBorders) {
            d.x = _.clamp(d.x + d.radius, d.radius, _this.width - d.radius);
            d.y = _.clamp(d.y + d.radius, d.radius, _this.height - d.radius);
          }
          c = d3.hsl(d.color);
          if (_this.hueChange) {
            c.h += 0.01;
          }
          c.opacity = d.opacity;
          if (_this.ticks === (_this.count - 1)) {
            c.opacity = 1;
          }
          d.color = c.toString();
          if (!d.dead) {
            _this.ctx.beginPath();
            _this.ctx.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
            _this.ctx.closePath();
            _this.ctx.fillStyle = d.color;
            _this.ctx.fill();
          }
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
