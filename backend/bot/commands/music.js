'use strict';

/**
 * Module dependencies.
 * @private
 */
const search = require('./_vk-search.js');

async function run ({ bot, args, options }) {
  // Вернём популярные аудио, если запрос не указан.
  if (!args.fullText) {
    return bot.api.call('audio.getPopular', { count: 5 })
      .then(response => {
        if (!response.items || !response.items.length) 
          return;

        const tracks = [];

        for (let item of response.items) 
          tracks.push('audio' + item.owner_id + '_' + item.id);

        return {
          attachments: tracks
        }
      })
      .catch(error => {

        return;
      });
  }

  return search('music', { bot, args, options });
}

module.exports = {
  aliases:   ['музыка'], 
  help_text: '/music [запрос] [кол-во]\n\nОсуществляет поиск аудиозаписей во ВКонтакте по заданному запросу.', 
  run
}