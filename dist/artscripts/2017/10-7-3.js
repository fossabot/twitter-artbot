// Generated by CoffeeScript 1.12.6
(function() {
  var GenArt, _, argv, art, clColors, d3, deg2rad, options, path, pdistance, pointInCircle, run, seed;

  Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
  };

  Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
  };

  path = require('path');

  d3 = require('d3');

  argv = require('yargs').alias('s', 'seed').argv;

  _ = require('lodash');

  seed = Date.now();

  clColors = require('nice-color-palettes/500');

  GenArt = require('@ejfox/four-seventeen');

  deg2rad = Math.PI / 180;

  options = {
    filename: path.basename(__filename, '.js') + '-' + seed,
    numTicks: 6111,
    count: 12,
    randomizeTicks: true,
    randomizeCount: true,
    bgColor: 'white',
    constrainEdges: false
  };

  pointInCircle = function(x, y, cx, cy, radius) {
    var distancesquared;
    distancesquared = (x - cx) * (x - cx) + (y - cy) * (y - cy);
    return distancesquared <= radius * radius;
  };

  pdistance = function(x1, y1, x2, y2) {
    var a, b, c;
    a = x1 - x2;
    b = y1 - y2;
    return c = Math.sqrt(a * a + b * b);
  };

  art = new GenArt(seed, options);

  art.makeParticles = function() {
    var c, column, composite, i, particleH, particleW, row, xpos, xposStart, ypos;
    console.log('Making ' + this.count + ' particles');
    this.colors = this.chance.pickone(clColors);
    this.ctx.fillStyle = this.colors[this.colors.length - 1];
    this.colors.pop();
    this.ctx.fillRect(0, 0, this.width, this.height);
    if (this.chance.bool({
      likelihood: 30
    })) {
      composite = 'multiply';
      console.log(composite);
      this.ctx.globalCompositeOperation = composite;
      this.opacity = 0.45;
    }
    xposStart = 12;
    xpos = xposStart;
    ypos = 12;
    particleW = 32;
    particleH = 32;
    this.maxRadius = this.chance.integer({
      min: 1,
      max: 19
    });
    this.data = [];
    row = 0;
    i = 0;
    while (row < this.count / 2) {
      column = 0;
      c = d3.hsl(this.chance.pickone(this.colors));
      c.opacity = this.opacity;
      while (column < this.count / 2) {
        this.data.push({
          i: i,
          x: xpos,
          y: ypos,
          angleStep: this.chance.floating({
            min: 0.01,
            max: 1
          }),
          targetx: xpos + this.chance.integer({
            min: 25,
            max: 100
          }),
          targety: ypos + this.chance.integer({
            min: 25,
            max: 100
          }),
          xStepAmount: this.chance.floating({
            min: 0.001,
            max: 1.2
          }),
          yStepAmount: this.chance.floating({
            min: 0.001,
            max: 1.2
          }),
          radius: this.chance.integer({
            min: 1,
            max: 8
          }),
          sinRadius: this.chance.integer({
            min: 10,
            max: this.width
          }),
          color: c.toString(),
          targetColor: this.chance.pickone(this.colors),
          angle: this.chance.integer({
            min: 0,
            max: 359
          })
        });
        i++;
        xpos += particleW;
        column++;
      }
      xpos = xposStart;
      ypos += particleH;
      row++;
    }
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
        var c, moveAmount, noiseValue, randompoint, xStepAmount, yStepAmount;
        noiseValue = _this.simplex.noise2D(d.x, d.y) * _this.chance.floating({
          min: 0.1,
          max: 0.7
        });
        d.radius += noiseValue;
        d.radius = _.clamp(d.radius, 0, _this.maxRadius);
        moveAmount = d.radius * _this.chance.floating({
          min: 0.06,
          max: 0.2
        });
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
        xStepAmount = d.xStepAmount * _this.chance.floating({
          min: 0.1,
          max: 0.7
        });
        yStepAmount = d.xStepAmount * _this.chance.floating({
          min: 0.1,
          max: 0.7
        });
        d.distance = pdistance(d.x, d.y, d.targetx, d.targety);
        if (d.x < d.targetx) {
          d.x += xStepAmount;
        }
        if (d.x > d.targetx) {
          d.x -= xStepAmount;
        }
        if (d.y < d.targety) {
          d.y += yStepAmount;
        }
        if (d.y > d.targety) {
          d.y -= yStepAmount;
        }
        if (_.find(_this.data, function(m) {
          return pointInCircle(d.x, d.y, m.x, m.y, m.radius + d.radius);
        })) {
          d.x += xStepAmount * 4;
          d.y += yStepAmount * 4;
        }
        if (_this.chance.bool({
          likelihood: 2
        })) {
          randompoint = _this.chance.pickone(_this.data);
          d.targetx = randompoint.x;
          d.targety = randompoint.y;
        }
        if (_this.chance.bool()) {
          d.angle += _this.chance.floating({
            min: -xStepAmount / 2,
            max: xStepAmount / 2
          });
        }
        d.x = d.x + Math.cos(d.angle * deg2rad);
        d.y = d.y + Math.sin(d.angle * deg2rad);
        d.angle += d.angleStep;
        if (_this.chance.bool()) {
          if (d.angle > 360) {
            d.angle = 0;
          }
          if (d.angle < 0) {
            d.angle = 360;
          }
        }
        c = d3.hsl(d.color);
        c.h += _this.chance.floating({
          min: -0.01,
          max: 0.05
        });
        c.h = d.distance * 0.01 + _this.chance.floating({
          min: 0.1,
          max: 0.6
        } + noiseValue);
        d.color = c.toString();
        if (_this.constrainEdges) {
          d.x = _.clamp(d.x, 0 + d.radius, _this.width - d.radius);
          d.y = _.clamp(d.y, 0 + d.radius, _this.height - d.radius);
        }
        _this.ctx.beginPath();
        _this.ctx.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
        _this.ctx.fillStyle = d.color;
        return _this.ctx.fill();
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
