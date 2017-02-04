'use strict';

/**
 * Module dependencies.
 * @private
 */
const search = require('./_vk-search.js');

async function run ({ id, app, args, options }) {
  return await search('gif', { id, app, args, options });
}

module.exports = {
  aliases:   ['гиф', 'гифка'], 
  help_text: '/gif <запрос> [кол-во]\n\nОсуществляет поиск .gif-документов во ВКонтакте по заданному запросу.', 
  price:     2, 
  run
}