// Generated by CoffeeScript 1.12.6
(function() {
  var GenArt, _, argv, art, clColors, d3, deg2rad, options, path, run, seed;

  path = require('path');

  d3 = require('d3');

  argv = require('yargs').alias('s', 'seed').argv;

  seed = Date.now();

  _ = require('lodash');

  clColors = require('nice-color-palettes/100');

  deg2rad = Math.PI / 180;

  GenArt = require('./GenArt');

  options = {
    filename: path.basename(__filename, '.js') + '-' + seed,
    count: 1,
    randomizeCount: false,
    numTicks: 95555,
    randomizeTicks: true,
    bgColor: 'white',
    fillColor: 'black',
    constrainEdges: true,
    opacity: 0.8
  };

  art = new GenArt(seed, options);

  art.makeParticles = function() {
    this.ctx.globalCompositeOperation = 'multiply';
    this.opacity = this.chance.floating({
      min: 0.5,
      max: 1
    });
    this.colors = this.chance.pickone(clColors);
    this.colors = this.chance.pickset(this.colors, this.chance.integer({
      min: 2,
      max: 4
    }));
    console.log('Making ' + this.count + ' particles');
    this.data = d3.range(this.count).map((function(_this) {
      return function() {
        var c, offset, offsetAmount, x, y;
        offsetAmount = _this.chance.integer({
          min: 25,
          max: _this.width
        });
        offset = {};
        offset.x = _this.chance.floating({
          min: -offsetAmount,
          max: offsetAmount
        });
        offset.y = _this.chance.floating({
          min: -offsetAmount,
          max: offsetAmount
        });
        x = (_this.width / 2) + offset.x;
        y = (_this.height / 2) + offset.y;
        x = _.clamp(x, 0, _this.width);
        y = _.clamp(y, 0, _this.height);
        c = d3.hsl(_this.chance.pickone(_this.colors));
        c.opacity = _this.opacity;
        return {
          x: _this.width / 2,
          y: _this.height / 2,
          color: c.toString(),
          angle: 0,
          angleStep: _this.chance.floating({
            min: -8,
            max: 8
          }),
          angleClamp: _this.chance.bool(),
          noise: _this.chance.floating({
            min: 0.001,
            max: 0.8
          }),
          hueNoise: _this.chance.bool()
        };
      };
    })(this));
    return this.data;
  };

  art.tick = function() {
    var stepMax, ticks;
    if (!this.ticks) {
      ticks = 0;
    }
    this.ticks++;
    stepMax = this.chance.integer({
      min: 1,
      max: 16
    });
    return this.data.forEach((function(_this) {
      return function(d, i) {
        var c, height, noiseValue;
        noiseValue = _this.simplex.noise2D(d.x, d.y) * 0.25;
        if (_this.chance.bool({
          likelihood: 20
        })) {
          d.angleStep += noiseValue * _this.chance.floating({
            min: 0.001,
            max: 12
          });
        }
        if (_this.chance.bool({
          likelihood: _this.ticks * 0.25
        })) {
          d.angleStep -= noiseValue * _this.chance.floating({
            min: 1,
            max: 22
          });
        }
        if (d.x === 0) {
          d.angle = _this.chance.integer({
            min: 90,
            max: 360
          });
        } else if (d.x === _this.width) {
          d.angle = _this.chance.integer({
            min: 90,
            max: 360
          });
        } else if (d.y === 0) {
          d.angle = _this.chance.integer({
            min: 0,
            max: 180
          });
        } else if (d.y === _this.height) {
          d.angle = _this.chance.integer({
            min: 180,
            max: 360
          });
        }
        d.x = d.x + Math.cos(d.angle * deg2rad);
        d.y = d.y + Math.sin(d.angle * deg2rad);
        d.angle += d.angleStep;
        if (d.angleClamp) {
          d.angleStep = _.clamp(d.angleStep, -2, 2);
        } else {
          d.angleStep = _.clamp(d.angleStep, -stepMax, stepMax);
        }
        if (d.angle > 360) {
          d.angle = 0;
        }
        if (_this.constrainEdges) {
          d.x = _.clamp(d.x, 0, _this.width);
          d.y = _.clamp(d.y, 0, _this.height);
        }
        _this.ctx.beginPath();
        height = 1;
        _this.ctx.rect(d.x, d.y, 1, height);
        c = d3.hsl(d.color);
        c.h += 0.12;
        if (d.hueNoise) {
          c.h += noiseValue * (d.angle * 0.01);
        }
        c.s += noiseValue * d.noise;
        c.l += noiseValue * d.noise;
        d.color = c.toString();
        _this.ctx.fillStyle = d.color;
        _this.ctx.fill();
        return _this.ctx.closePath();
      };
    })(this));
  };

  run = function() {
    if (argv.seed) {
      seed = argv.seed;
    } else {
      seed = Date.now();
    }
    art.seed = seed;
    return art.init({
      save: true
    });
  };

  if (require.main === module) {
    run();
  }

  module.exports = art;

}).call(this);
