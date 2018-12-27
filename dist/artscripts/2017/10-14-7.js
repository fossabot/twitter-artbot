// Generated by CoffeeScript 1.12.6
(function() {
  var GenArt, OBJLoader, _, argv, art, clColors, d3, fs, objData, options, path, run, seed;

  path = require('path');

  d3 = require('d3');

  _ = require('lodash');

  argv = require('yargs').alias('s', 'seed').argv;

  fs = require('fs');

  seed = Date.now();

  global.THREE = require('../../lib/three/three.js');

  require('../../lib/three/canvasrenderer.js');

  require('../../lib/three/projector.js');

  clColors = require('nice-color-palettes/100');

  OBJLoader = require('three-obj-loader');

  OBJLoader(THREE);

  GenArt = require('@ejfox/four-seventeen');

  options = {
    filename: path.basename(__filename, '.js') + '-' + seed,
    count: 25,
    randomizeCount: true,
    numTicks: 10,
    randomizeTicks: true,
    bgColor: 'white',
    fillColor: 'black'
  };

  objData = require('../models/trump.json');

  art = new GenArt(seed, options);

  art.makeParticles = function() {
    this.loader = require('three-json-loader')(THREE);
    fs.readFile('./lib/obj/sniper-tf2.json', (function(_this) {
      return function(err, data) {
        var bg, camSize;
        if (err) {
          throw err;
        }
        _this.colors = _this.chance.pickone(clColors);
        if (_this.chance.bool()) {
          _this.colors.push('#FFF');
        }
        _this.maxSegments = _this.chance.integer({
          min: 4,
          max: 64
        });
        console.log('colors ->', _this.colors);
        _this.cubes = [];
        _this.scene = new THREE.Scene();
        bg = _this.colors[_this.colors.length - 1];
        _this.colors.pop();
        _this.scene.background = new THREE.Color(bg);
        camSize = _this.chance.integer({
          min: 18,
          max: 72
        });
        _this.camera = new THREE.PerspectiveCamera(camSize, 1, 1, 10000);
        _this.camera.position.z = _this.chance.integer({
          min: 12,
          max: 60
        });
        _this.camera.rotation.z = _this.chance.integer({
          min: -2,
          max: 2
        });
        _this.light = new THREE.PointLight(new THREE.Color(_this.chance.pickone(_this.colors)), 1.2);
        _this.light.position.set(0, 0, 12);
        _this.light.castShadow = true;
        _this.light.position.y = _this.chance.integer({
          min: -25,
          max: 25
        });
        _this.light.position.z = _this.chance.integer({
          min: 25,
          max: 90
        });
        _this.scene.add(_this.light);
        _this.canvas.style = {};
        _this.renderer = new THREE.CanvasRenderer({
          canvas: _this.canvas
        });
        _this.renderer.shadowMapEnabled = true;
        _this.renderer.shadowMapSoft = true;
        _this.renderer.shaadowMapBias = 0.0039;
        _this.renderer.shadowMapDarkness = _this.chance.floating({
          min: 0.1,
          max: 0.8
        });
        _this.renderer.shadowMapWidth = 1024;
        _this.renderer.shadowMapHeight = 1024;
        _this.renderer.setSize(_this.width, _this.height);
        _this.renderer.setClearColor(0x3399ff);
        return _this.renderer.render(_this.scene, _this.camera);
      };
    })(this));
    console.log('Making ' + this.count + ' particles');
    this.data = d3.range(this.count).map((function(_this) {
      return function() {
        return {
          sup: 'sup'
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
    return this.ticks++;
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
