// Generated by CoffeeScript 1.12.6
(function() {
  var GenArt, argv, art, clColors, coolWords, d3, options, path, run, seed;

  path = require('path');

  d3 = require('d3');

  argv = require('yargs').alias('s', 'seed').argv;

  seed = Date.now();

  clColors = require('nice-color-palettes/500');

  GenArt = require('./../GenArt');

  coolWords = ['able', 'bad', 'best', 'better', 'big', 'black', 'certain', 'clear', 'different', 'early', 'easy', 'economic', 'federal', 'free', 'full', 'good', 'great', 'hard', 'high', 'human', 'important', 'international', 'large', 'late', 'little', 'local', 'long', 'low', 'major', 'military', 'national', 'new', 'old', 'only', 'other', 'political', 'possible', 'public', 'real', 'recent', 'right', 'small', 'social', 'special', 'strong', 'sure', 'true', 'white', 'whole', 'young'];

  options = {
    filename: path.basename(__filename, '.js') + '-' + seed,
    count: 4,
    numTicks: 1,
    bgColor: '#e4dfd1',
    fillColor: 'black',
    randomizeCount: false,
    randomizeTicks: true,
    opacity: 0.4,
    blendMode: 'multiply'
  };

  art = new GenArt(seed, options);

  art.makeParticles = function() {
    this.word = this.chance.animal();
    this.colors = ['#217BC3', '#E82117', '#F2DB00'];
    this.blendMode = this.chance.pickone(['multiply', 'xor']);
    this.textUppercase = this.chance.bool();
    this.opacity = this.chance.floating({
      min: 0.6,
      max: 0.9
    });
    this.circles = this.chance.bool();
    this.count = this.word.length;
    this.ctx.font = '8px monospace';
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(this.word, 10, 18);
    this.data = d3.range(this.count).map((function(_this) {
      return function(d, i) {
        var c, offset, offsetAmount, x, y;
        offsetAmount = _this.chance.integer({
          min: 5,
          max: _this.width / 3.2
        });
        offset = {};
        offset.y = _this.chance.floating({
          min: -(offsetAmount * 1.5),
          max: offsetAmount
        });
        x = 220 + (i * 100);
        y = (_this.height / 1.5) + offset.y;
        c = d3.hsl(_this.chance.pickone(_this.colors));
        c.opacity = _this.opacity;
        return {
          x: x,
          y: y,
          radius: offsetAmount * 2,
          color: c.toString(),
          text: _this.word[i]
        };
      };
    })(this));
    return this.data;
  };

  art.tick = function() {
    if (!this.ticks) {
      this.ticks = 0;
    }
    this.ticks++;
    return this.data.forEach((function(_this) {
      return function(d, i) {
        var noiseValue, text;
        noiseValue = _this.simplex.noise2D(d.x, d.y);
        _this.ctx.beginPath();
        _this.ctx.font = d.radius + 'px sans-serif';
        text = d.text;
        if (_this.textUppercase) {
          text = d.text.toUpperCase();
        }
        _this.ctx.textAlign = 'center';
        _this.ctx.fillStyle = d.color;
        _this.ctx.fillText(text, d.x, d.y);
        if (_this.chance.bool({
          likelihood: 50
        })) {
          d.y += _this.chance.floating({
            min: -200,
            max: 200
          });
        }
        if (_this.chance.bool() && _this.circles) {
          _this.ctx.arc(d.x, d.y, d.radius / 10, 0, 2 * Math.PI);
        }
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
