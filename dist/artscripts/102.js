// Generated by CoffeeScript 1.12.6
(function() {
  var argv, canvasModule, d3, d3Node, d3n, fs, makeArt, randGen, run;

  fs = require('fs');

  d3 = require('d3');

  d3Node = require('d3-node');

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
    var canvas, ctx, data, fileOutput, height, i, rand, width;
    rand = new randGen();
    rand.seed(seed);
    console.log('seed', seed);
    canvas = d3n.createCanvas(850, 625);
    ctx = canvas.getContext('2d');
    width = canvas.width;
    height = canvas.height;
    i = 0;
    data = d3.range(999).map(function() {
      i++;
      return {
        x1: rand(width),
        y1: rand(height),
        x2: rand(width),
        y2: rand(width / 2) * rand(1),
        width: 2,
        height: i
      };
    });
    data.forEach(function(d, i) {
      ctx.beginPath();
      ctx.moveTo(d.x1, d.y1);
      ctx.lineTo(d.x2, d.y2);
      return ctx.stroke();
    });
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
