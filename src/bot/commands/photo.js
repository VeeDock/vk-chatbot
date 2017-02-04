'use strict';

/**
 * Module dependencies.
 * @private
 */
const search = require('./_vk-search.js');

async function run ({ id, app, args, options }) {
  return await search('photo', { id, app, args, options });
}

module.exports = {
  aliases:   ['фото'], 
  help_text: '/photo <запрос> [кол-во]\n\nОсуществляет поиск фотографий во ВКонтакте по заданному запросу.', 
  run
}