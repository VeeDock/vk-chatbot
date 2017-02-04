'use strict';

/**
 * Module dependencies.
 * @private
 */
const redis = require('../../database/redis');

/**
 * Режим голосования для бесед. 
 *
 * Игнорируем абсолютно все команды и обращения к боту. 
 * Записываем присланные варианты ответов в redis.
 */
async function processor ({ id, data, app, user }) {
  // Берём первый символ сообщения.
  let num = data.message.slice(0, 1);

  // Если это цифра от 1 до 5, то считаем её за вариант ответа.
  if (/[1-5]/.test(num)) {
    await redis.call('hset', `votes:${data.conversation_id}:${id}`, data.sender_id, num);
  }

  return;
}

module.exports = {
  process: processor
};