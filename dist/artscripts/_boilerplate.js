// Generated by CoffeeScript 1.12.6
(function() {
  var Chance, GenArt, SimplexNoise, _, argv, art, canvasModule, d3, d3Node, fs, path, seed;

  fs = require('fs');

  d3 = require('d3');

  _ = require('lodash');

  d3Node = require('d3-node');

  canvasModule = require('canvas-prebuilt');

  Chance = require('chance');

  SimplexNoise = require('simplex-noise');

  path = require('path');

  argv = require('yargs').alias('s', 'seed').argv;

  seed = Date.now();

  GenArt = require('./GenArt');

  art = new GenArt(seed);

  art.filename = path.basename(__filename, '.js') + '-' + seed;

  art.count = 8;

  art.numTicks = 5000;

  art.bgColor = '#999';

  art.fillColor = 'black';

  art.simplex = new SimplexNoise;

  art.makeParticles = function() {
    console.log('Making ' + this.count + ' particles');
    this.data = d3.range(this.count).map((function(_this) {
      return function() {
        var c, offset, offsetAmount, x, y;
        offsetAmount = _this.chance.integer({
          min: 25,
          max: 500
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
        c = d3.hsl('white');
        c.opacity = _this.opacity;
        return {
          x: x,
          y: y,
          color: c.toString()
        };
      };
    })(this));
    return this.data;
  };

  art.tick = function() {
    var ticks;
    if (!this.ticks) {
      ticks = 0;
    }
    this.ticks++;
    return this.data.forEach((function(_this) {
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
        _this.ctx.beginPath();
        _this.ctx.rect(d.x, d.y, 1, 1);
        _this.ctx.fillStyle = _this.fillColor;
        _this.ctx.fill();
        return _this.ctx.closePath();
      };
    })(this));
  };

  art.init({
    save: true
  });

  module.exports = GenArt;

}).call(this);
