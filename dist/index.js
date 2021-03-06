// Generated by CoffeeScript 1.12.6
(function() {
  var Chance, SimplexNoise, T, Twit, argv, artScriptChoice, artScripts, canvasModule, chance, chooseRandomScript, d3, d3Node, d3n, env, exportAllScripts, fs, handleTweetEvent, makeMovie, randGen, runMinute, schedule, stream, tweetArt, tweetCron, uploadTweet;

  env = require('node-env-file');

  env('.env', {
    raise: false,
    overwrite: true
  });

  fs = require('fs');

  d3 = require('d3');

  d3Node = require('d3-node');

  canvasModule = require('canvas-prebuilt');

  randGen = require('random-seed');

  Twit = require('twit');

  Chance = require('chance');

  chance = new Chance();

  SimplexNoise = require('simplex-noise');

  schedule = require('node-schedule');

  argv = require('yargs').alias('f', 'force').alias('m', 'movie').argv;

  chooseRandomScript = function(artScripts) {
    var rand;
    rand = randGen.create();
    return artScripts[rand(artScripts.length)];
  };

  artScripts = ['2018/12-20'];

  if (argv.artscript) {
    artScriptChoice = argv.artscript;
  } else {
    artScriptChoice = chooseRandomScript(artScripts);
  }

  d3n = new d3Node({
    canvasModule: canvasModule
  });

  T = new Twit({
    consumer_key: process.env.BOT_CONSUMER_KEY,
    consumer_secret: process.env.BOT_CONSUMER_SECRET,
    access_token: process.env.BOT_ACCESS_TOKEN,
    access_token_secret: process.env.BOT_ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000
  });

  exportAllScripts = function() {
    var artScript, exportArt;
    console.log('Exporting all scripts');
    artScript = 0;
    exportArt = function() {
      var art;
      artScriptChoice = artScripts[artScript];
      console.log('Exporting ' + artScriptChoice);
      art = require('./artscripts/' + artScriptChoice);
      artScript++;
      return art.init({}, function() {
        return art.saveFile(artScriptChoice, function() {
          return exportArt();
        });
      });
    };
    return exportArt();
  };

  handleTweetEvent = function(tweet) {
    var from, replyTo;
    console.log('New tweet');
    replyTo = tweet.in_reply_to_screen_name;
    from = tweet.user.screen_name;
    if (replyTo = '417am1975') {
      console.log('New @mention', tweet.text);
      return tweetArt('12-29-4', {
        text: tweet.text,
        mention: from
      });
    }
  };

  uploadTweet = function(status, b64Content) {
    return T.post('media/upload', {
      media_data: b64Content
    }, function(err, data, response) {
      var altText, mediaIdStr, meta_params;
      mediaIdStr = data.media_id_string;
      console.log('🐦 Uploading image...');
      if (!err) {
        console.log('🐦 Image id:', mediaIdStr);
        altText = "Art";
        meta_params = {
          media_id: mediaIdStr,
          alt_text: {
            text: altText
          }
        };
        return T.post('media/metadata/create', meta_params, function(err, data, response) {
          var params;
          if (!err) {
            params = {
              status: status,
              media_ids: [mediaIdStr]
            };
            return T.post('statuses/update', params, function(err, data, response) {
              console.log('🐦 👍 Tweet tweeted!');
              return console.log('🐦 Twitter ID: ', data.id);
            });
          } else {
            return console.log('Error: ', err);
          }
        });
      } else {
        return console.log('Error uploading media: ', err);
      }
    });
  };

  tweetArt = function(forceArtscriptChoice, options) {
    var art;
    artScriptChoice = chooseRandomScript(artScripts);
    if (forceArtscriptChoice) {
      artScriptChoice = forceArtscriptChoice;
    }
    console.log('🐦 Choosing... ', artScriptChoice);
    art = require('./artscripts/' + artScriptChoice);
    return art.init(options, function() {
      var artBots, canvas, tweetText;
      if (!options) {
        options = {};
      }
      canvas = art.canvas;
      if (art.text) {
        tweetText = art.text + ' ' + artScriptChoice + '-' + art.seed;
      } else if (art.text && options.mention) {
        tweetText = '@' + options.mention + ' ' + art.text + ' ' + artScriptChoice + '-' + art.seed;
      } else {
        tweetText = artScriptChoice + '-' + (art.seed || seed);
      }
      artBots = ['pixelsorter', 'a_quilt_bot', 'Lowpolybot', 'clipartbot', 'artyedit', 'artyPolar', 'artyPetals', 'IMG2ASCII', 'kaleid_o_bot', 'TweetMe4Moji', 'SUPHYPEBOT', 'colorisebot'];
      if (chance.bool({
        likelihood: 1
      })) {
        tweetText += ' #bot2bot @' + chance.pickone(artBots);
      }
      console.log('🐦 text: ', tweetText);
      return uploadTweet(tweetText, canvas.toDataURL().split(',')[1]);
    });
  };

  makeMovie = function() {
    var art;
    console.log('makeMovie');
    console.log('Running ', artScriptChoice);
    art = require('./artscripts/' + artScriptChoice);
    art.init = function() {
      var loopTicks, t, tMax;
      this.chance = new Chance(this.seed);
      this.simplex = new SimplexNoise(Chance.random);
      console.log('Seed:', this.seed);
      console.log('width', this.width, 'height', this.height);
      this.makeCanvas();
      this.makeParticles();
      t = 0;
      tMax = this.numTicks;
      console.log('Exporting ' + tMax + ' frames');
      loopTicks = (function(_this) {
        return function() {
          _this.tick();
          return _this.saveFile(artScriptChoice + '-mov-' + t + '-' + _this.seed, function() {
            t++;
            if (t < tMax) {
              return loopTicks();
            } else {
              return console.log('Completed exporting ticks');
            }
          });
        };
      })(this);
      return loopTicks();
    };
    return art.init();
  };

  if (argv.force) {
    tweetArt();
  } else if (argv.movie) {
    makeMovie();
  } else if (argv.exportall) {
    exportAllScripts();
  } else {
    stream = T.stream('user');
    runMinute = 20;
    console.log('Running... waiting for **:' + runMinute);
    tweetCron = schedule.scheduleJob(runMinute + ' * * * *', function() {
      console.log('Gonna tweet some art now!');
      return tweetArt();
    });
  }

}).call(this);
