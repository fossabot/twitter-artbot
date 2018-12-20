// Generated by CoffeeScript 1.12.6
(function() {
  var GenArt, _, argv, art, clColors, d3, options, path, run, seed;

  path = require('path');

  d3 = require('d3');

  argv = require('yargs').alias('s', 'seed').argv;

  seed = Date.now();

  _ = require('lodash');

  clColors = require('nice-color-palettes/100');

  GenArt = require('./../GenArt');

  options = {
    filename: path.basename(__filename, '.js') + '-' + seed,
    count: 25,
    randomizeCount: true,
    numTicks: 12000,
    randomizeTicks: true,
    bgColor: 'white',
    fillColor: 'black'
  };

  art = new GenArt(seed, options);

  art.makeParticles = function() {
    var startX;
    console.log('Making ' + this.count + ' particles');
    this.colors = this.chance.pickone(clColors);
    this.color = this.chance.pickone(this.colors);
    this.ctx.globalCompositeOperation = 'multiply';
    if (this.count <= 2) {
      this.count = 3;
    }
    this.curveOptions = [d3.curveMonotoneX, d3.curveBasisOpen, d3.curveNatural];
    this.line = d3.line().x(function(d) {
      return d.x;
    }).y(function(d) {
      return d.y;
    }).curve(this.chance.pickone(this.curveOptions)).curve(d3.curveBasisOpen).context(this.ctx);
    startX = this.chance.integer({
      min: 100,
      max: this.width - 100
    });
    this.data = d3.range(this.count).map((function(_this) {
      return function(d, i) {
        var c, offset, offsetAmount, x, y;
        offsetAmount = _this.chance.integer({
          min: 25,
          max: _this.width / 4
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
        x = _this.width / 2;
        y = i * (_this.height / (_this.count - 1));
        c = d3.hsl('white');
        c.opacity = _this.opacity;
        return {
          x: x,
          y: y,
          color: c.toString(),
          radius: 4
        };
      };
    })(this));
    this.ogData = this.data;
    return this.data;
  };

  art.tick = function() {
    var c, sStep;
    if (!this.ticks) {
      this.ticks = 0;
    }
    this.ticks++;
    this.data.forEach((function(_this) {
      return function(d, i) {
        var maxStep, noiseValue, ogd;
        noiseValue = _this.simplex.noise2D(d.x, d.y) * _this.chance.floating({
          min: 0.1,
          max: 2
        });
        ogd = _this.ogData[i];
        d.x = _.clamp(d.x, 0, _this.width);
        d.y = _.clamp(d.y, 0, _this.height);
        if (_this.chance.bool()) {
          if (ogd.x < d.x) {
            d.x += noiseValue;
          }
          if (ogd.y < d.y) {
            d.y += noiseValue;
          }
          if (ogd.x > d.x) {
            d.x -= noiseValue;
          }
          if (ogd.y > d.y) {
            d.y -= noiseValue;
          }
        }
        maxStep = i * 0.65;
        if (i === _this.data.length - 1) {
          maxStep *= 1.5;
        }
        maxStep = _.clamp(maxStep, 0, _this.width / 4);
        if (_this.chance.bool({
          likelihood: 20
        })) {
          d.x += _this.chance.floating({
            min: -maxStep,
            max: maxStep
          });
        }
        if (_this.chance.bool({
          likelihood: 20
        })) {
          return d.y += _this.chance.floating({
            min: -maxStep,
            max: maxStep
          });
        }
      };
    })(this));
    c = d3.hsl(this.color);
    if (this.chance.bool()) {
      sStep = 0.1;
      c.s += this.chance.floating({
        min: -sStep,
        max: sStep
      });
    }
    c.h += 0.15 + (this.ticks / 100000);
    if (c.h === 359) {
      d.h = 0;
    }
    c.opacity = 0.05;
    this.color = c.toString();
    this.ctx.beginPath();
    this.line(this.data);
    this.ctx.lineWidth = 1.5;
    if (this.chance.bool()) {
      this.ctx.strokeStyle = this.color;
    } else {
      this.ctx.strokeStyle = this.bgColor;
    }
    return this.ctx.stroke();
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