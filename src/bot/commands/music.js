'use strict';

/**
 * Module dependencies.
 * @private
 */
const search = require('./_vk-search.js');

async function run ({ id, app, args, options }) {
  // Вернём популярные аудио, если запрос не указан.
  if (!args.fullText) {
    let VK = app.get('api', id);

    return await VK.call('audio.getPopular', { count: 5 })
      .then(response => {
        if (!response.items || !response.items.length) 
          return;

        let tracks = [];

        for (let item of response.items) 
          tracks.push('audio' + item.owner_id + '_' + item.id);

        return {
          attachments: tracks
        };
      })
      .catch(error => {
        // @todo: Log error

        return;
      });
  }

  return await search('music', { id, app, args, options });
}

module.exports = {
  aliases:   ['музыка'], 
  help_text: '/music [запрос] [кол-во]\n\nОсуществляет поиск аудиозаписей во ВКонтакте по заданному запросу.', 
  run
}