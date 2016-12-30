'use strict';

/**
 * Module dependencies.
 * @private
 */
const botIds   = require('../../../data/bots');
const accounts = require('../../../accounts');

/**
 * Добавляет два новых свойства:
 * {
 *   ourBotsInChat: Boolean, // true, если в беседе присутствует более одного нашего бота
 *   tooMuchBots:   Boolean  // true, если в беседе ботов более 50% от общего количества участников
 * }
 *
 * Если ourBotsInChat === true, то свойство tooMuchBots добавлено не будет.
 *
 * * Только для бесед.
 *
 * @param {Obejct} messageObj Объект сообщения
 * @public
 *
 * Функции передаётся контекст (this) класса Bot (./bot/Bot.js)
 */
function middleware (messageObj) {
  let chatUsersIds  = Object.keys(messageObj.chatUsers || {});
  let botId         = String(messageObj.botId); // Приводим ID бота к строке для точного сравнения
  let ourBotsInChat;
  let tooMuchBots;

  if (messageObj.isMultichat && chatUsersIds.length > 0) {
    // Отсортированный массив ID участников беседы и всех наших ботов
    let ourBotsIds = Object.keys(accounts).filter(v => v !== botId).concat(chatUsersIds).sort();

    // Смотрим, есть ли несколько наших ботов в чате
    for (let i = 0, len = ourBotsIds.length; i < len; i++) {
      if (ourBotsIds[i + 1] !== undefined) {
        if (ourBotsIds[i] === ourBotsIds[i + 1]) 
          return {
            ourBotsInChat: true
          }
      }
    }

    // Отсортированный массив ID участников беседы и всех известных чужих ботов
    let anothersBotsIds = botIds.concat(chatUsersIds).sort();

    // Количество найденных в беседе ботов (изначально = 1, т.к. в беседе есть уже один наш бот)
    let matchesCount = 1;

    // Считаем, сколько ботов в беседе
    for (let i = 0, len = anothersBotsIds.length; i < len; i++) {
      if (anothersBotsIds[i + 1] !== undefined) {
        if (anothersBotsIds[i] === anothersBotsIds[i + 1]) 
          matchesCount++;
      }
    }

    // Ботов в беседе более 50%
    if ((matchesCount*100/chatUsersIds.length) > 50) 
      return {
        ourBotsInChat: false, 
        tooMuchBots:   true
      }
  }

  return { 
    ourBotsInChat: false, 
    tooMuchBots:   false
  }
}

module.exports = middleware;