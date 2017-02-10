'use strict';

/**
 * Module dependencies.
 * @private
 */
const exec    = require('child_process').exec;
const Spinner = require('cli-spinner').Spinner;

function build () {
  let spnr = new Spinner('%s Building in progress..');
      spnr.setSpinnerString(18);
      spnr.start();

  exec('bash ./.manage/build/build.sh', (error, stdout, stderr) => {
    spnr.stop();

    console.log(' Done.');
    console.log(stdout);
  });
}

build();