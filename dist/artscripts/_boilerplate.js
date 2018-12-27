// Generated by CoffeeScript 1.12.6
(function() {
  var GenArt, argv, art, clColors, d3, options, path, run, seed;

  path = require('path');

  d3 = require('d3');

  argv = require('yargs').alias('s', 'seed').argv;

  seed = Date.now();

  clColors = require('nice-color-palettes/500');

  GenArt = require('@ejfox/four-seventeen');

  options = {
    filename: path.basename(__filename, '.js') + '-' + seed,
    count: 12,
    numTicks: 1200,
    bgColor: '#f6f6eb',
    fillColor: 'black',
    randomizeCount: false,
    randomizeTicks: false,
    radius: 1
  };

  art = new GenArt(seed, options);

  art.makeParticles = function() {
    this.colors = this.chance.pickone(clColors);
    this.fillColor = this.chance.pickone(this.colors);
    this.data = d3.range(this.count).map((function(_this) {
      return function() {
        var c, offset, offsetAmount, x, y;
        offsetAmount = _this.chance.integer({
          min: 0,
          max: _this.width / 3
        });
        offset = {
          x: _this.chance.floating({
            min: -offsetAmount,
            max: offsetAmount
          }),
          y: _this.chance.floating({
            min: -offsetAmount,
            max: offsetAmount
          })
        };
        x = (_this.width / 2) + offset.x;
        y = (_this.height / 2) + offset.y;
        c = d3.hsl(_this.fillColor);
        c.opacity = _this.opacity;
        return {
          x: x,
          y: y,
          radius: _this.radius,
          color: c.toString()
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
        var moveAmount;
        moveAmount = 2;
        if (_this.chance.bool({
          likelihood: 50
        })) {
          d.x += _this.chance.floating({
            min: -moveAmount,
            max: moveAmount
          });
        }
        if (_this.chance.bool({
          likelihood: 50
        })) {
          d.y += _this.chance.floating({
            min: -moveAmount,
            max: moveAmount
          });
        }
        _this.ctx.beginPath();
        _this.ctx.rect(d.x, d.y, 1, 1);
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
