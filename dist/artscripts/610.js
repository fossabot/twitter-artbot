// Generated by CoffeeScript 1.12.6
(function() {
  var Chance, GenArt, SimplexNoise, _, argv, canvasModule, d3, d3Node, fs, path, run, seedrandom,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs-extra');

  d3 = require('d3');

  _ = require('lodash');

  d3Node = require('d3-node');

  canvasModule = require('canvas-prebuilt');

  Chance = require('chance');

  path = require('path');

  seedrandom = require('seedrandom');

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
      var d3n, size, sizes;
      console.log('Seed:', seed);
      d3n = new d3Node({
        canvasModule: canvasModule
      });
      this.seed = seed;
      this.chance = new Chance(this.seed);
      seedrandom(this.seed, {
        global: true
      });
      this.opacity = this.chance.floating({
        min: 0.001,
        max: 0.95,
        fixed: 2
      });
      this.linkOpacity = this.chance.floating({
        min: 0.001,
        max: 0.15,
        fixed: 2
      });
      sizes = [[1080, 720], [900, 900], [1200, 1200], [900, 500]];
      if (this.chance.bool({
        likelihood: 10
      })) {
        sizes.push([320, 320]);
      }
      if (this.chance.bool({
        likelihood: 10
      })) {
        sizes.push([320, 960]);
      }
      size = this.chance.pickone(sizes);
      this.width = size[0];
      this.height = size[1];
      console.log('width', this.width, 'height', this.height);
      this.count = 25;
      this.numTicks = 1500;
      this.linkCount = this.count * 0.8;
      this.count = this.chance.integer({
        min: 5,
        max: this.count
      });
      this.linkCount = this.chance.integer({
        min: 5,
        max: this.linkCount
      });
      this.numTicks = this.chance.integer({
        min: this.numTicks / 2,
        max: this.numTicks * 1.5
      });
      this.colors = ['#1AF8FA', '#FA023C', '#C8FF00', '#FF0092', '#FFCA1B', '#B6FF00', '#228DFF', '#BA01FF'];
      this.colors = _.shuffle(this.colors);
      if (this.chance.bool()) {
        this.colors = this.colors.splice(0, this.chance.integer({
          min: 1,
          max: this.colors.length - 1
        }));
      }
      this.hueChange = this.chance.bool({
        likelihood: 60
      });
      this.sizeChange = this.chance.bool({
        likelihood: 40
      });
      this.multiColor = this.chance.bool({
        likelihood: 82
      });
      this.clampBorders = this.chance.bool({
        likelihood: 78
      });
      this.useLinks = this.chance.bool({
        likelihood: 64
      });
      this.oneLinkTarget = this.chance.bool({
        likelihood: 45
      });
      this.drawLinks = false;
      this.allLinked = this.chance.bool({
        likelihood: 76
      });
      this.coloredLinks = this.chance.bool({
        likelihood: 6
      });
      this.straightLines = this.chance.bool({
        likelihood: 6
      });
      this.connectToCenter = this.chance.bool({
        likelihood: 26
      });
      this.curveTho = this.chance.floating({
        min: 0.9,
        max: 1.3
      });
      this.curveThe = this.chance.floating({
        min: 0.9,
        max: 1.3
      });
      this.text += ' ' + this.curveTho + 'tho';
      this.text += ' ' + this.curveThe + 'the';
      this.text += ' colors: ' + JSON.stringify(this.colors);
      this.numTicks = this.chance.integer({
        min: this.numTicks / 2,
        max: this.numTicks
      });
      this.canvas = d3n.createCanvas(this.width, this.height);
      this.ctx = this.canvas.getContext('2d');
      this.clampNum = this.chance.floating({
        min: 1.5,
        max: 8,
        fixed: 3
      });
      this.simplex = new SimplexNoise(Math.random);
      this.bgColor = d3.hsl(this.chance.pickone(['#413D3D', '#040004']));
      this.ctx.fillStyle = this.bgColor.toString();
      this.ctx.fillRect(0, 0, this.width, this.height);
      if (this.chance.bool({
        likelihood: 1
      })) {
        this.ctx.globalCompositeOperation = 'multiply';
      }
      if (this.chance.bool({
        likelihood: 1
      })) {
        this.ctx.globalCompositeOperation = 'difference';
      }
      if (this.chance.bool({
        likelihood: 1
      })) {
        this.ctx.globalCompositeOperation = 'lighten';
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
      console.log('curveTho', this.curveTho);
      console.log('curveThe', this.curveThe);
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
      c = this.chance.pickone(this.colors);
      this.data = d3.range(this.count).map((function(_this) {
        return function(d, i) {
          var radius;
          if (_this.multiColor) {
            c = _this.chance.pickone(_this.colors);
          }
          radius = _this.chance.integer({
            min: 0.5,
            max: 2.5
          });
          return {
            index: i,
            id: i,
            color: c.toString(),
            opacity: _this.opacity,
            radius: radius
          };
        };
      })(this));
      console.log('Making ' + this.linkCount + ' links');
      linkTarget = this.chance.integer({
        min: 1,
        max: this.count - 1
      });
      this.links = d3.range(this.linkCount).map((function(_this) {
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
            target: linkTarget,
            distance: _this.chance.integer({
              min: _this.width / 10,
              max: _this.width / 5
            })
          };
        };
      })(this));
      return this.data.forEach((function(_this) {
        return function(d, i) {
          var color;
          color = _this.chance.pickone(['rgba(5,5,5,0.2)', 'rgba(255,255,255,0.5)']);
          return _this.links.push({
            source: i,
            target: _this.chance.integer({
              min: 1,
              max: _this.count - 1
            }),
            distance: _this.chance.integer({
              min: _this.width / 20,
              max: _this.width / 5
            }),
            color: color
          });
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
        min: 0.0005,
        max: 0.005,
        fixed: 6
      });
      console.log('alphaDecay: ' + alphaDecay);
      collideStrength = this.chance.floating({
        min: 0.01,
        max: 0.09,
        fixed: 3
      });
      console.log('collideStrength: ' + collideStrength);
      manyBodyStrength = this.chance.floating({
        min: -30,
        max: 30,
        fixed: 3
      });
      console.log('manyBodyStrength: ' + manyBodyStrength);
      this.simulation = d3.forceSimulation().nodes(this.data).alphaDecay(alphaDecay).force('collide', d3.forceCollide(function(d) {
        return d.radius * collideMult;
      }).strength(collideStrength)).force('center', d3.forceCenter(this.width / 2, this.height / 2)).force('charge', d3.forceManyBody().strength(manyBodyStrength)).force('links', d3.forceLink(this.links).distance(function(d) {
        return d.distance;
      }));
      return this.simulation.stop();
    };

    GenArt.prototype.tick = function(callback) {
      var c, clampNum, gvx, gvy, stepValue;
      this.ticks++;
      if (this.chance.bool({
        likelihood: 10
      })) {
        this.curveTho += this.chance.floating({
          min: -1,
          max: 1,
          fixed: 2
        });
      }
      if (this.chance.bool({
        likelihood: 20
      })) {
        this.curveThe += this.chance.floating({
          min: -1,
          max: 1,
          fixed: 2
        });
      }
      this.simulation.tick();
      gvy = this.chance.floating();
      gvx = this.chance.floating();
      stepValue = this.chance.floating({
        min: 0.8,
        max: 1.6
      });
      clampNum = this.clampNum;
      this.links.forEach((function(_this) {
        return function(d, i) {
          var cpx, cpy;
          if (!_this.connectToCenter) {
            _this.ctx.moveTo(d.source.x, d.source.y);
          } else {
            _this.ctx.moveTo(_this.width / 2, _this.height / 2);
          }
          if (_this.chance.bool()) {
            cpx = d.target.x / _this.curveTho;
            cpy = d.target.y / _this.curveThe;
          } else {
            cpx = d.target.x / _this.curveThe;
            cpy = d.target.y / _this.curveTho;
          }
          if (_this.straightLines) {
            return _this.ctx.lineTo(d.target.x, d.target.y);
          } else {
            return _this.ctx.quadraticCurveTo(cpx, cpy, d.target.x, d.target.y);
          }
        };
      })(this));
      if (this.coloredLinks) {
        c = d3.hsl(this.chance.pickone(this.colors));
      } else {
        c = d3.hsl('#FFF');
      }
      c.opacity = this.linkOpacity;
      this.ctx.strokeStyle = c.toString();
      this.ctx.stroke();
      return this.data.forEach((function(_this) {
        return function(d, i) {
          var noiseValue;
          if (d.y > _this.height || d.y < 0) {
            d.dead = true;
          }
          if (d.x > _this.width || d.x < 0) {
            d.dead = true;
          }
          noiseValue = _this.simplex.noise2D(d.x, d.y);
          if (_this.chance.bool()) {
            d.vx += noiseValue * 2.4;
          } else {
            d.vx -= noiseValue * 2.4;
          }
          if (_this.chance.bool()) {
            d.vy += noiseValue * 2.4;
          } else {
            d.vy -= noiseValue * 2.4;
          }
          if (_this.sizeChange) {
            d.radius += noiseValue / 2.5;
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
            d.radius = d.radius * 4;
            c.opacity = 1;
          }
          d.color = c.toString();
          if (!d.dead) {
            _this.ctx.beginPath();
            _this.ctx.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
            _this.ctx.closePath();
            c = d3.hsl(d.color);
            c.opacity = d.opacity;
            _this.ctx.fillStyle = c.toString();
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
