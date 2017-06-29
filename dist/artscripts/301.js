// Generated by CoffeeScript 1.12.6
(function() {
  var Chance, GenArt, Image, _, argv, canvasModule, d3, d3Node, fs, path, request, run,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  d3 = require('d3');

  _ = require('lodash');

  d3Node = require('d3-node');

  canvasModule = require('canvas-prebuilt');

  Image = canvasModule.Image;

  Chance = require('chance');

  path = require('path');

  request = require('request');

  argv = require('yargs').alias('s', 'seed').argv;

  GenArt = (function() {
    function GenArt(seed) {
      this.tick = bind(this.tick, this);
      this.makeParticles = bind(this.makeParticles, this);
      this.processImage = bind(this.processImage, this);
      this.init = bind(this.init, this);
      var d3n;
      console.log('Seed:', seed);
      d3n = new d3Node({
        canvasModule: canvasModule
      });
      this.seed = seed;
      this.chance = new Chance(this.seed);
      this.count = 2900;
      this.numTicks = 1;
      this.count = this.chance.integer({
        min: 1,
        max: this.count
      });
      this.width = 850;
      this.height = 625;
      console.log('width', this.width, 'height', this.height);
      this.canvas = d3n.createCanvas(this.width, this.height);
      this.ctx = this.canvas.getContext('2d');
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    GenArt.prototype.init = function(options, callback) {
      var url;
      if (options == null) {
        options = {};
      }
      url = 'http://source.unsplash.com/collection/363/#{@width}x#{@height}/';
      return request.get({
        url: url,
        encoding: null
      }, (function(_this) {
        return function(err, res, body) {
          var image;
          console.log('getting');
          if (err) {
            console.log(error);
          }
          image = new Image();
          image.onerror = function() {
            return console.log('error', arguments);
          };
          image.onload = function() {
            console.log('loaded image');
            _this.ctx.drawImage(image, 0, 0);
            _this.processImage();
            _this.tickTil(_this.numTicks);
            if (options.save) {
              _this.saveFile();
            }
            if (callback) {
              return callback();
            }
          };
          return image.src = body;
        };
      })(this));
    };

    GenArt.prototype.processImage = function() {
      var imageData, pixelData, pixels;
      imageData = this.ctx.getImageData(0, 0, this.width, this.height);
      pixels = imageData.data;
      pixelData = [];
      this.count = pixels.length;
      return this.data = d3.range(this.count / 4).map((function(_this) {
        return function(d, i) {
          var a, b, c, g, r, x, y;
          x = (i / 4) % _this.width;
          y = Math.floor((i / 4) / _this.width);
          r = pixels[i];
          g = pixels[i + 1];
          b = pixels[i + 2];
          a = pixels[i + 3];
          c = d3.hsl("rgba(" + r + "," + g + "," + b + "," + a + ")");
          return {
            x: x,
            y: y,
            color: c.toString(),
            c: c,
            r: r,
            g: g,
            b: b,
            a: a
          };
        };
      })(this));
    };

    GenArt.prototype.makeParticles = function() {
      console.log('Making ' + this.count + ' particles');
      this.data = d3.range(this.count).map((function(_this) {
        return function() {
          var c, x, y;
          x = _this.chance.natural({
            min: 0,
            max: _this.width
          });
          y = _this.chance.natural({
            min: 0,
            max: _this.height
          });
          c = d3.hsl('red');
          c.h += _this.chance.natural({
            min: 0,
            max: 14
          });
          return {
            x: x,
            y: y,
            color: c.toString()
          };
        };
      })(this));
      return this.data;
    };

    GenArt.prototype.tick = function() {
      this.ticks++;
      return this.data.forEach((function(_this) {
        return function(d, i) {
          var size;
          size = 1;
          if (_this.chance.bool({
            likelihood: 15
          })) {
            _this.ctx.beginPath();
            _this.ctx.rect(d.x - (size / 2), d.y - -(size / 2), size, size);
            _this.ctx.fillStyle = d.color;
            _this.ctx.fill();
            return _this.ctx.closePath();
          }
        };
      })(this));
    };

    GenArt.prototype.tickTil = function(count) {
      var j, ref;
      console.log('Ticking ' + this.data.length + ' particles ' + count + ' times');
      console.time('ticked for');
      for (j = 0, ref = count; 0 <= ref ? j <= ref : j >= ref; 0 <= ref ? j++ : j--) {
        this.tick();
      }
      return console.timeEnd('ticked for');
    };

    GenArt.prototype.saveFile = function(filename) {
      var fileOutput;
      if (!filename) {
        filename = path.basename(__filename, '.js') + '-' + this.seed;
      }
      fileOutput = './dist/' + filename + '.png';
      console.log('canvas output --> ' + fileOutput);
      return this.canvas.pngStream().pipe(fs.createWriteStream(fileOutput));
    };

    return GenArt;

  })();

  run = (function(_this) {
    return function() {
      var genart, seed;
      if (argv.seed) {
        seed = argv.seed;
      } else {
        seed = Date.now();
      }
      genart = new GenArt(seed);
      if (argv.count) {
        genart.count = argv.count;
      }
      if (argv.ticks) {
        genart.numTicks = argv.ticks;
      }
      return genart.init({
        save: true
      });
    };
  })(this);

  module.exports = GenArt;

  if (require.main === module) {
    run();
  }

}).call(this);
