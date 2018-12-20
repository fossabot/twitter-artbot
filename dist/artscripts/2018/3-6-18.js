// Generated by CoffeeScript 1.12.6
(function() {
  var GenArt, _, argv, art, d3, options, path, run, seed;

  path = require('path');

  d3 = require('d3');

  argv = require('yargs').alias('s', 'seed').argv;

  seed = Date.now();

  _ = require('lodash');

  GenArt = require('./../GenArt');

  options = {
    filename: path.basename(__filename, '.js') + '-' + seed,
    count: 69,
    numTicks: 2,
    bgColor: 'white',
    fillColor: 'black'
  };

  art = new GenArt(seed, options);

  art.makeParticles = function() {
    var buildingSizes, i;
    console.log('Making ' + this.count + ' particles');
    i = 0;
    buildingSizes = [
      {
        width: 72,
        height: 32
      }, {
        width: 16,
        height: 140
      }, {
        width: 8,
        height: 92
      }
    ];
    this.data = d3.range(this.count).map((function(_this) {
      return function() {
        var buildingSize, c, height, offset, offsetAmount, width, x, y;
        offsetAmount = _this.chance.integer({
          min: 2,
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
        y = _this.height * 0.85;
        if (_this.presetBuildingSizes) {
          buildingSize = _this.chance.pickone(buildingSizes);
          width = buildingSize.width;
          height = buildingSize.height;
        } else {
          width = _this.chance.pickone([8, 16, 24, 72]);
          height = width * _this.chance.integer({
            min: 1,
            max: 12
          });
          height = _.clamp(height, 0, _this.height * 0.88);
        }
        y = y - height;
        c = d3.hsl('white');
        c.opacity = _this.opacity;
        return {
          x: x,
          y: y,
          color: c.toString(),
          height: height,
          width: width
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
    this.data.forEach((function(_this) {
      return function(d, i) {
        var noiseValue;
        noiseValue = _this.simplex.noise2D(d.x, d.y);
        if (_this.chance.bool({
          likelihood: 50
        })) {
          d.x += _this.chance.floating({
            min: -2,
            max: 2
          });
        }
        if (_this.chance.bool({
          likelihood: 50
        })) {
          d.y += _this.chance.floating({
            min: -2,
            max: 2
          });
        }
        if (noiseValue > 0) {
          d.x += _this.chance.floating({
            min: -2,
            max: 2
          });
        } else {
          d.y += _this.chance.floating({
            min: -2,
            max: 2
          });
        }
        _this.ctx.beginPath();
        _this.ctx.rect(d.x, d.y, d.width, d.height);
        _this.ctx.fillStyle = _this.fillColor;
        _this.ctx.strokeStyle = _this.bgColor;
        _this.ctx.fill();
        _this.ctx.stroke();
        return _this.ctx.closePath();
      };
    })(this));
    if (this.ticks === this.numTicks) {
      console.log('last frame');
      this.ctx.beginPath();
      this.ctx.rect(0, this.height * 0.8, this.width, 200);
      this.ctx.fillStyle = 'black';
      this.ctx.fill();
      return this.ctx.closePath();
    }
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