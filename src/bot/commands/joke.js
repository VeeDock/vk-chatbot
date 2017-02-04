'use strict';

/**
 * Module dependencies.
 * @private
 */
const prequest = require('request-promise');

async function run ({ id, app, args, options }) {
  return await prequest('http://www.anekdot.ru/rss/randomu.html')
    .then(response => {
      let match = response.match(/\['([^']+)/);
          match = match && match[1].replace(/<br>/, '\n');

      return {
        message:      match, 
        replace_urls: true
      };
    })
    .catch(error => {
      // @todo: Log error

      return 'Произошла неизвестная ошибка, повторите запрос позже.';
    });
}

module.exports = {
  aliases:   ['анекдот'], 
  help_text: '/joke\n\nПрисылает случайный анекдот с anekdot.ru.', 
  run
};