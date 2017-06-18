// Generated by CoffeeScript 1.12.6
(function() {
  var _, argv, canvasModule, d3, d3Node, d3n, fs, makeArt, randGen, run;

  fs = require('fs');

  d3 = require('d3');

  d3Node = require('d3-node');

  _ = require('lodash');

  canvasModule = require('canvas-prebuilt');

  randGen = require('random-seed');

  d3n = new d3Node({
    canvasModule: canvasModule
  });

  argv = require('yargs').alias('s', 'seed').argv;

  run = function() {
    var seed;
    if (argv.seed) {
      seed = argv.seed;
    } else {
      seed = Date.now();
    }
    return makeArt(seed);
  };

  makeArt = function(seed) {
    var canvas, colorCatScale, colorScale, count, ctx, cycle, data, fileOutput, height, i, k, rand, redPoints, width;
    rand = new randGen();
    rand.seed(seed);
    console.log('seed', seed);
    canvas = d3n.createCanvas(850, 625);
    ctx = canvas.getContext('2d');
    width = canvas.width;
    height = canvas.height;
    i = 0;
    count = 1500;
    colorScale = d3.scaleLinear().domain(0, count).range('#CCC ', '#000');
    colorCatScale = d3.scaleOrdinal().range(['#DD577A', '#49AEC0', '#FFF0CF', '#131723']);
    redPoints = d3.range(3).map(function() {
      return {
        x: rand(width),
        y: rand(height)
      };
    });
    data = d3.range(count).map(function() {
      var j, z;
      z = 150;
      j = Math.abs((i % z) - (z / 2));
      i++;
      return {
        i: i,
        x: rand(width),
        y: rand(height),
        color: colorCatScale(i),
        j: j * 2
      };
    });
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    for (i = k = 1; k <= 5000; i = ++k) {
      cycle = i;
      data.forEach(function(d, i) {
        var c, color;
        if (d.x < width / 2) {
          d.x = d.x + rand(d.j);
        }
        if (d.x > width / 2) {
          d.x = d.x - rand(d.j);
        }
        if (rand(100) > 50 && d.y - (height / 2)) {
          d.y = d.y + rand(2);
        }
        color = d.color;
        c = d3.hsl(color);
        c.h += rand(2);
        d.color = c.toString();
        ctx.fillStyle = d.color;
        if (!d.dead) {
          return ctx.fillRect(d.x, d.y, 1, 1);
        }
      });
    }
    fileOutput = './dist/' + seed + '.png';
    console.log('canvas output --> ' + fileOutput);
    canvas.pngStream().pipe(fs.createWriteStream(fileOutput));
    return canvas;
  };

  module.exports = makeArt;

  if (require.main === module) {
    run();
  }

}).call(this);
