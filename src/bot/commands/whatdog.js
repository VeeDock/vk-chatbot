'use strict';

/**
 * Module dependencies.
 * @private
 */
const microsoftServices = require('./_microsoft-services');

async function run ({ id, app, args, options }) {
  return await microsoftServices('what-dog', { id, app, args, options });
}

module.exports = {
  aliases:   ['порода'], 
  help_text: '/whatdog <изображение>\n\nОпределяет породу собаки по фото.', 
  run
};