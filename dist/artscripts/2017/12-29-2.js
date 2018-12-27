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
    width: 1920,
    height: 1200,
    filename: path.basename(__filename, '.js') + '-' + seed,
    count: 24,
    randomizeCount: true,
    numTicks: 18000,
    minTicks: 1400,
    randomizeTicks: true,
    bgColor: 'white',
    fillColor: 'black',
    opacity: 0.05,
    margin: 120,
    decay: 0.25,
    offsetSize: 0.75
  };

  art = new GenArt(seed, options);

  art.makeParticles = function() {
    var anchor, colorRange, startX;
    console.log('Making ' + this.count + ' particles');
    this.colors = this.chance.pickone(clColors);
    this.color = this.chance.pickone(this.colors);
    this.ctx.globalCompositeOperation = 'multiply';
    if (this.count <= 3) {
      this.count = 4;
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
      min: this.margin,
      max: this.width - this.margin
    });
    anchor = {
      x: this.width / 2,
      y: this.height / 2
    };
    this.data = d3.range(this.count).map((function(_this) {
      return function(d, i) {
        var c, offsetAmount, x, y;
        offsetAmount = _this.chance.integer({
          min: 55,
          max: _this.width * _this.offsetSize
        });
        _this.beta = 0;
        _this.betaStep = 1 / _this.numTicks;
        c = d3.hsl('white');
        c.opacity = _this.opacity;
        x = anchor.x + _this.chance.integer({
          min: -offsetAmount,
          max: offsetAmount
        });
        y = anchor.y + _this.chance.integer({
          min: -offsetAmount,
          max: offsetAmount
        });
        anchor.x = x;
        anchor.y = y;
        x = _.clamp(x, 0 + _this.margin, _this.width - _this.margin);
        y = _.clamp(y, 0 + _this.margin, _this.height - _this.margin);
        return {
          x: x,
          y: y
        };
      };
    })(this));
    this.ogData = this.data;
    this.data.forEach((function(_this) {
      return function(d, i) {
        _this.ctx.beginPath();
        _this.ctx.strokeStyle = '#000';
        _this.ctx.arc(d.x, d.y, 13, 0, 2 * Math.PI);
        return _this.ctx.stroke();
      };
    })(this));
    return this.data;
  };

  art.tick = function() {
    var c;
    if (!this.ticks) {
      this.ticks = 0;
    }
    this.ticks++;
    this.line.curve(d3.curveBundle.beta(+this.beta));
    this.beta += this.betaStep;
    this.data.forEach((function(_this) {
      return function(d, i) {
        var maxStep, noiseValue, ogd;
        noiseValue = _this.simplex.noise2D(d.x, d.y);
        ogd = _this.ogData[i];
        if (_this.chance.bool({
          likelihood: 15
        })) {
          d.x += noiseValue;
          d.y += noiseValue;
        }
        d.x = _.clamp(d.x, 0 + _this.margin, _this.width - _this.margin);
        d.y = _.clamp(d.y, 0 + _this.margin, _this.height - _this.margin);
        maxStep = (i * _this.decay) + noiseValue;
        maxStep = _.clamp(maxStep, 0.01, _this.width / 4);
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
    c.opacity = this.opacity;
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
