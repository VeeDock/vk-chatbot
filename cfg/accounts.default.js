'use strict';

/**
 * Информация об аккаунтах ботов.
 */

module.exports = {
  <bot_id>: { // ID аккаунта бота

    // Имя бота
    name:      '<bot_name>',  // String

    // Паттерн обращения к боту
    pattern:   <bot_pattern>, // RegExp

    // Условие, при котором бот добавит юзера в друзья
    // Возможные на данный момент варианты: '', 'followed'
    condition: '<condition>', // String

    auth: {
      login: '<bot_login>',   // String
      phone: '<bot_phone>',   // String
      pass:  '<bot_password>' // String
    }
  }, 

  <bot_id>: { <...> }, 

  <...>
}