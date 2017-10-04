// Generated by CoffeeScript 1.12.6
(function() {
  var Chance, GenArt, _, argv, art, d3, options, path, run, seed;

  path = require('path');

  d3 = require('d3');

  _ = require('lodash');

  argv = require('yargs').alias('s', 'seed').argv;

  seed = Date.now();

  Chance = require('chance');

  GenArt = require('./GenArt');

  options = {
    filename: path.basename(__filename, '.js') + '-' + seed,
    count: 50,
    numTicks: 900,
    bgColor: 'white',
    fillColor: 'white',
    opacity: 1,
    randomizeCount: true,
    randomizeTicks: true,
    radius: 64,
    minRadius: 4,
    drawLinks: false,
    constrainEdges: true,
    colorChangeAmount: 2.5
  };

  art = new GenArt(seed, options);

  art.makeParticles = function() {
    var alphaDecay, charge, i, j, ref, velocityDecay;
    console.log('Making ' + this.count + ' particles');
    this.colors = ['#2ed991', '#2ed9c9', '#2e87d9', '#dbdf1d', '#d92e99', '#d92752', '#2799d9'];
    this.data = d3.range(this.count).map((function(_this) {
      return function(d, i) {
        var c, color, datum, offset, offsetAmount, x, y;
        offsetAmount = _this.chance.integer({
          min: 250,
          max: 900
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
        x = 0;
        y = (_this.height / 2) + offset.y;
        color = _this.chance.pickone(_this.colors);
        c = d3.hsl(color);
        c.opacity = _this.opacity;
        datum = {
          color: c.toString(),
          radius: _this.radius,
          opacity: _this.opacity
        };
        if (i === 1) {
          datum.radius = _this.chance.integer({
            min: 50,
            max: 150
          });
        }
        if (i % 25 >= 1) {
          datum.x = _this.width * 0.2;
          datum.y = _this.height / 2;
        }
        return datum;
      };
    })(this));
    this.links = d3.range(this.count * this.chance.floating({
      min: 0.1,
      max: 4
    })).map((function(_this) {
      return function() {
        return {
          source: _this.chance.integer({
            min: 0,
            max: _this.count - 1
          }),
          target: _this.chance.integer({
            min: 0,
            max: _this.count - 1
          })
        };
      };
    })(this));
    for (i = j = 0, ref = this.data.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      this.links.push({
        source: 1,
        target: i
      });
    }
    alphaDecay = this.chance.floating({
      min: 0.05,
      max: 0.25
    });
    velocityDecay = this.chance.floating({
      min: 0.01,
      max: 0.25
    });
    charge = this.chance.floating({
      min: -30,
      max: 30
    });
    this.simulation = d3.forceSimulation(this.data).alphaDecay(alphaDecay).velocityDecay(velocityDecay).force('charge', d3.forceManyBody().strength(charge)).force('collide', d3.forceCollide(function(d) {
      return d.radius * 1.2;
    }).iterations(8)).force('link', d3.forceLink(this.links).distance(10).strength(0.5)).force('center', d3.forceCenter(this.width / 2, this.height / 2));
    return this.data;
  };

  art.tick = function() {
    var ticks;
    if (!this.ticks) {
      ticks = 0;
    }
    this.ticks++;
    this.simulation.tick();
    if (this.drawLinks) {
      if (this.chance.bool({
        likelihood: 5
      })) {
        this.links.forEach((function(_this) {
          return function(d, i) {
            _this.ctx.beginPath();
            _this.ctx.moveTo(d.source.x, d.source.y);
            _this.ctx.lineTo(d.target.x, d.target.y);
            _this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            return _this.ctx.stroke();
          };
        })(this));
      }
    }
    return this.data.forEach((function(_this) {
      return function(d, i) {
        var c, noiseValue;
        noiseValue = _this.simplex.noise2D(d.x, d.y);
        if (i === 1) {
          d.opacity = 0;
          if (_this.chance.bool({
            likelihood: 70
          })) {
            d.x += _this.chance.integer({
              min: -2,
              max: 7
            });
          }
        }
        if (_this.constrainEdges) {
          d.x = _.clamp(d.x, 0 + d.radius, _this.width - d.radius);
          d.y = _.clamp(d.y, 0 + d.radius, _this.height - d.radius);
          d.radius = _.clamp(d.radius, _this.minRadius, _this.width);
        }
        if (noiseValue > 0) {
          d.x += _this.chance.floating({
            min: -6,
            max: 6
          });
          d.radius -= noiseValue;
        } else {
          d.y += _this.chance.floating({
            min: -6,
            max: 6
          });
          d.radius += noiseValue * 0.1;
        }
        c = d3.hsl(d.color);
        c.h += _this.chance.integer({
          min: -_this.colorChangeAmount,
          max: _this.colorChangeAmount
        });
        c.opacity = d.opacity;
        d.color = c.toString();
        _this.ctx.beginPath();
        _this.ctx.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
        _this.ctx.fillStyle = 'white';
        _this.ctx.strokeStyle = d.color;
        console.log('ticks ', _this.ticks, ' - ', _this.numticks);
        if (_this.ticks > _this.numTicks * 0.98) {
          _this.ctx.fillStyle = d.color;
          _this.ctx.fill();
        }
        if (i !== 1) {
          _this.ctx.fill();
          _this.ctx.stroke();
        }
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
