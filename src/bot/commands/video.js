'use strict';

/**
 * Module dependencies.
 * @private
 */
const search = require('./_vk-search.js');

async function run ({ id, app, args, options }) {
  return await search('video', { id, app, args, options });
}

module.exports = {
  aliases:   ['видео'], 
  help_text: '/video <запрос> [кол-во]\n\nОсуществляет поиск видеозаписей во ВКонтакте по заданному запросу.', 
  price:     3, 
  run
}