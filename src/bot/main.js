'use strict';

const Application   = require('./base/Application');
const authenticator = require('./base/authenticator');

(async function main () {
  let tokens = await authenticator(require('../config/accounts'));
  let app    = Application.initialize(tokens);

  app.start();

  process.on('SIGINT', async () => {
    await app.stop();
    process.exit(0);
  });
})()
.catch(error => {
  // @todo: Log error
});