'use strict';

/**
 * Module dependencies.
 * @private
 */
const prequest = require('request-promise');
//const redis    = require('../../database/redis');

// @todo: cache current rate for 1 day

async function run ({ id, app, args, options }) {
  return await prequest('http://zenrus.ru/build/js/currents.js')
    .then(response => {
      try {
        let rates = JSON.parse(response.split('=')[1].trim());

        return `💵 1 доллар = ${rates[0]} руб.\n` + 
               `💶 1 евро = ${rates[1]} руб.\n` + 
               `🛢 1 баррель нефти = $${rates[2]}`;
      } catch (e) {
        return 'Данные не были получены, повторите запрос позже.';
      }
    })
    .catch(error => {
      // @todo: Log error

      return 'Произошла неизвестная ошибка, повторите запрос позже.';
    });
}

module.exports = {
  aliases:   ['курс', 'доллар', 'евро', 'нефть'], 
  help_text: '/rate\n\nПрисылает актуальный курс доллара, евро и нефти.', 
  run
}