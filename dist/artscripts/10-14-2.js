// Generated by CoffeeScript 1.12.6
(function() {
  var GenArt, argv, art, clColors, d3, options, path, run, seed;

  path = require('path');

  d3 = require('d3');

  argv = require('yargs').alias('s', 'seed').argv;

  seed = Date.now();

  global.THREE = require('../../lib/three/three.js');

  require('../../lib/three/canvasrenderer.js');

  require('../../lib/three/projector.js');

  clColors = require('nice-color-palettes/100');

  GenArt = require('./GenArt');

  options = {
    filename: path.basename(__filename, '.js') + '-' + seed,
    count: 5,
    numTicks: 60,
    randomizeTicks: true,
    bgColor: 'white',
    fillColor: 'black'
  };

  art = new GenArt(seed, options);

  art.makeParticles = function() {
    var cubeSize, faces, geometry, hex, hex2, material, segments;
    this.colors = this.chance.pickone(clColors);
    console.log('colors ->', this.colors);
    this.scene = new THREE.Scene();
    this.scene.background = '#FFFFFF';
    this.camera = new THREE.PerspectiveCamera(35, 1, 1, 10000);
    this.camera.position.y = 150;
    this.camera.position.z = 350;
    cubeSize = this.chance.integer({
      min: 25,
      max: 80
    });
    segments = this.chance.integer({
      min: 1,
      max: 4
    });
    geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize, segments, segments, segments);
    faces = 0;
    while (faces < geometry.faces.length) {
      hex = this.chance.pickone(this.colors);
      hex2 = this.chance.pickone(this.colors);
      geometry.faces[faces].color = new THREE.Color(hex);
      geometry.faces[faces + 1].color = new THREE.Color(hex);
      faces += 2;
    }
    material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.FaceColors,
      overdraw: 0.5,
      wireframe: this.chance.bool()
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.y = 150;
    this.cube.rotation.y = 45;
    this.scene.add(this.cube);
    this.canvas.style = {};
    this.renderer = new THREE.CanvasRenderer({
      canvas: this.canvas
    });
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setSize(this.width, this.height);
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
    var rotateAmount, ticks;
    if (!this.ticks) {
      ticks = 0;
    }
    this.ticks++;
    rotateAmount = 12;
    this.cube.rotation.y += this.chance.integer({
      min: -rotateAmount,
      max: rotateAmount
    });
    this.cube.rotation.x += this.chance.integer({
      min: -rotateAmount,
      max: rotateAmount
    });
    this.cube.rotation.z += this.chance.integer({
      min: -rotateAmount,
      max: rotateAmount
    });
    this.camera.position.y += this.chance.integer({
      min: -180,
      max: 180
    });
    return this.renderer.render(this.scene, this.camera);
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
