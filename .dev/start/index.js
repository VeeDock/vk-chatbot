'use strict';

/**
 * Module dependencies.
 * @private
 */
const fs    = require('fs');
const path  = require('path');
const pm2   = require('pm2');
const async = require('async');

if (!fs.existsSync('./build')) {
  console.log('Build the project first!', '`npm run build`');
  process.exit(0);
}

/**
 * pm2.start() wrapper
 * @param  {Array} arrayOfStartOpts
 * @return {Array}
 * @private
 */
function startWrapper (arrayOfStartOpts) {
  let output = [];

  for (let opt of arrayOfStartOpts) {
    output.push(function (callback) {
      return pm2.start(opt, callback);
    });
  }

  return output;
}

pm2.connect(error => {
  if (error) {
    console.log('Can\'t connect to pm2 daemon.');
    console.dir(error);
    process.exit(1);
  }

  // cwd = project root directory
  let cwd = process.cwd();

  async.series(
    startWrapper([
      // Server
      {
        name: 'www', 
        script: './build/www/main.js', 
        env: {
          DEBUG: process.env.DEBUG
        }, 
        cwd, 
        node_args: ['--harmony'], 
        error_file: path.join(cwd, './build/.logs/www-error.log'), 
        out_file: path.join(cwd, './build/.logs/www-out.log')
      }, 

      // Bot
      {
        name: 'bot', 
        script: './build/bot/main.js', 
        env: {
          DEBUG: process.env.DEBUG
        }, 
        cwd, 
        node_args: ['--harmony'], 
        error_file: path.join(cwd, './build/.logs/bot-error.log'), 
        out_file: path.join(cwd, './build/.logs/bot-out.log'), 
        max_memory_restart: '250M', 
        kill_timeout: 10000
      }
    ]), 
    function (error, results) {
      if (error) {
        console.log('Can\'t run all processes.');
        console.dir(error);
        process.exit(1);
      }

      console.log('All processes were successfully started!');

      pm2.disconnect();
    }
  );
});