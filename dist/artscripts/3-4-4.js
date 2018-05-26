// Generated by CoffeeScript 1.12.6
(function() {
  var D3Node, GenArt, TextToSVG, _, argv, art, cheerio, clColors, d3, d3n, options, parseSVG, path, run, seed, textToSVG;

  path = require('path');

  d3 = require('d3');

  D3Node = require('d3-node');

  d3n = new D3Node();

  argv = require('yargs').alias('s', 'seed').argv;

  seed = Date.now();

  _ = require('lodash');

  clColors = require('nice-color-palettes');

  parseSVG = require('svg-path-parser');

  TextToSVG = require('text-to-svg');

  textToSVG = TextToSVG.loadSync('fonts/blackjack.otf');

  cheerio = require('cheerio');

  GenArt = require('./GenArt');

  options = {
    filename: path.basename(__filename, '.js') + '-' + seed,
    count: 18,
    text: 'Love',
    width: 1920,
    height: 1080,
    numTicks: 417,
    minTicks: 24,
    randomizeTicks: true,
    fontSize: 512,
    bgColor: 'white',
    fillColor: 'black',
    opacity: 0.12
  };

  art = new GenArt(seed, options);

  art.makeParticles = function() {
    var $parsedTextpath, colorRange, d, parsedTextpath, startX, textsvg;
    console.log('Making ' + this.count + ' particles');
    this.colors = this.chance.pickone(clColors);
    this.color = this.chance.pickone(this.colors);
    this.ctx.globalCompositeOperation = 'multiply';
    this.fontSize = this.chance.floating({
      min: 192,
      max: this.width * 0.8
    });
    this.text = this.chance.pickone(['Atosa', 'ATOSA', 'atosa']);
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
    textsvg = textToSVG.getPath(this.text, {
      fontSize: this.fontSize,
      anchor: 'center middle',
      x: this.width / 2,
      y: this.height / 2
    });
    $parsedTextpath = cheerio.load(textsvg);
    d = $parsedTextpath('path').attr('d');
    parsedTextpath = parseSVG(d);
    parsedTextpath = parsedTextpath.filter(function(d) {
      return d.code !== 'Z';
    });
    this.data = parsedTextpath.map((function(_this) {
      return function(d, i) {
        var c, offsetAmount;
        offsetAmount = _this.chance.integer({
          min: 0.5,
          max: _this.width * 0.16
        });
        if (d.code === 'Q') {
          d.x = (d.x + d.x1) / 2;
          d.y = (d.y + d.y1) / 2;
        }
        _this.betaStep = 1 / _this.numTicks;
        _this.beta = 0;
        c = d3.hsl('white');
        c.opacity = _this.opacity;
        return {
          x: d.x + _this.chance.integer({
            min: -offsetAmount,
            max: offsetAmount
          }),
          y: d.y + _this.chance.integer({
            min: -offsetAmount,
            max: offsetAmount
          }),
          color: c.toString()
        };
      };
    })(this));
    this.ogData = this.data;
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
        noiseValue = _this.simplex.noise2D(d.x, d.y) * _this.chance.floating({
          min: 0.1,
          max: 2
        });
        ogd = _this.ogData[i];
        if (_this.chance.bool({
          likelihood: 4
        })) {
          d.x += noiseValue;
          d.y += noiseValue;
        }
        d.x = _.clamp(d.x, 0, _this.width);
        d.y = _.clamp(d.y, 0, _this.height);
        maxStep = (i * 0.1) + noiseValue;
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
