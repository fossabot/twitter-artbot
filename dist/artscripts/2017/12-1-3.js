// Generated by CoffeeScript 1.12.6
(function() {
  var GenArt, _, argv, art, clColors, d3, options, path, run, seed;

  path = require('path');

  d3 = require('d3');

  argv = require('yargs').alias('s', 'seed').argv;

  seed = Date.now();

  _ = require('lodash');

  clColors = require('nice-color-palettes/100');

  GenArt = require('@ejfox/four-seventeen');

  options = {
    filename: path.basename(__filename, '.js') + '-' + seed,
    count: 18,
    randomizeCount: true,
    numTicks: 16000,
    minTicks: 2500,
    randomizeTicks: true,
    bgColor: 'white',
    fillColor: 'black'
  };

  art = new GenArt(seed, options);

  art.makeParticles = function() {
    var colorRange, startX;
    console.log('Making ' + this.count + ' particles');
    this.colors = this.chance.pickone(clColors);
    this.color = this.chance.pickone(this.colors);
    this.ctx.globalCompositeOperation = 'multiply';
    if (this.count <= 2) {
      this.count = 3;
    }
    this.curveOptions = [d3.curveMonotoneX];
    console.log('NUM TICKSSSSSSS', this.numTicks);
    colorRange = [this.chance.pickone(this.colors), this.chance.pickone(this.colors)];
    if (this.chance.bool()) {
      colorRange.push(this.chance.pickone(this.colors));
      if (this.chance.bool()) {
        colorRange.push(this.chance.pickone(this.colors));
      }
    }
    this.colorScale = d3.scaleLinear().domain([0, 1]).interpolate(d3.interpolateHsl).range(colorRange);
    this.line = d3.line().x(function(d) {
      return d.x;
    }).y(function(d) {
      return d.y;
    }).context(this.ctx);
    startX = this.chance.integer({
      min: 100,
      max: this.width - 100
    });
    this.data = d3.range(this.count).map((function(_this) {
      return function(d, i) {
        var c, offset, offsetAmount, x, y;
        offsetAmount = _this.chance.integer({
          min: 75,
          max: _this.width * 0.9
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
        y = _this.height / 2;
        _this.betaStep = 1 / _this.numTicks;
        _this.beta = 0;
        c = d3.hsl('white');
        c.opacity = _this.opacity;
        return {
          x: x + _this.chance.integer({
            min: -offsetAmount,
            max: offsetAmount
          }),
          y: y + _this.chance.integer({
            min: -offsetAmount,
            max: offsetAmount
          }),
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
    this.line.curve(d3.curveBundle.beta(+this.beta));
    this.beta += this.betaStep;
    this.data.forEach((function(_this) {
      return function(d, i) {
        var maxStep, noiseValue, ogd;
        noiseValue = _this.simplex.noise2D(d.x, d.y) * _this.chance.floating({
          min: 0.1,
          max: 2
        });
        ogd = _this.ogData[i];
        if (_this.chance.bool()) {
          d.x += noiseValue;
          d.y += noiseValue;
        }
        d.x = _.clamp(d.x, 0, _this.width);
        d.y = _.clamp(d.y, 0, _this.height);
        maxStep = (i * 0.05) + noiseValue;
        maxStep = _.clamp(maxStep, 0.01, _this.width / 8);
        if (_this.chance.bool({
          likelihood: 5
        })) {
          d.x += _this.chance.floating({
            min: -maxStep,
            max: maxStep
          });
        }
        if (_this.chance.bool({
          likelihood: 5
        })) {
          return d.y += _this.chance.floating({
            min: -maxStep,
            max: maxStep
          });
        }
      };
    })(this));
    c = d3.hsl(this.colorScale(this.beta));
    if (this.chance.bool({
      likelihood: 0.1
    })) {
      sStep = this.chance.floating({
        min: 0.01,
        max: 0.1
      });
      c.s += this.chance.floating({
        min: -sStep,
        max: sStep
      });
    }
    c.h += 0.05;
    if (c.h === 359) {
      d.h = 0;
    }
    c.opacity = 0.05;
    this.color = c.toString();
    this.ctx.beginPath();
    this.line(this.data);
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeStyle = this.color;
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
