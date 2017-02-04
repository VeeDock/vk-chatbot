'use strict';

/**
 * Module dependencies.
 * @private
 */
const microsoftServices = require('./_microsoft-services');

async function run ({ id, app, args, options }) {
  return await microsoftServices('how-old', { id, app, args, options });
}

module.exports = {
  aliases:   ['возраст'], 
  help_text: '/howold <изображение>\n\nОпределяет возраст человека по фотографии.', 
  run
}