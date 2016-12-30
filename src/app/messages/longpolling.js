'use strict';

/**
 * Module dependencies
 * @private
 */
const debug        = require('../../lib/simple-debug')(__filename);
const prequest     = require('request-promise');

/**
 * Собирает объект сообщения из массива данных, который был получен через LongPolling.
 * @param   {Array} item
 * @return  {Object}
 * @private
 * 
 * Функции передаётся контекст (this) класса Messages (./Messages.js)
 */
function messageAssembler (item) {
  // Текст сообщения
  let message = item[6] || '';

  // ID сообщения
  let messageId = item[1];

  // Вложения (прикрепления)
  let attachments = item[7] || {};

  // ID диалога
  let convId = parseInt(item[3]);

  // ID беседы
  let mchatId = convId - 2000000000;

  // ID пользователя, от которого пришло сообщение в беседу
  let mchatFromId = parseInt(attachments.from);

  // == true, если сообщение пришло в беседе
  let isMultichat = mchatFromId && true || false;

  // Точный ID диалога, в который пришло сообщение
  let dialogId = isMultichat ? mchatId : convId;

  // Точный ID пользователя, от которого пришло сообщение
  let fromId = isMultichat ? mchatFromId : convId;

  // Объект сообщения (для использования в парсерах, миддлвэйрах и командах)
  let messToParse = {
    _vkapi: this.parent.VKApi, 
    attachments, 
    botId: this.parent._botId, 
    chatId: dialogId, 
    chatUsers: isMultichat && this._conversations[mchatId].users || null, 
    fromId, 
    isMultichat, 
    message, 
    messageId
  };

  return messToParse;
}

/**
 * Проверка флагов полученного сообщения (для личных сообщений).
 * @param  {Number} flag Флаг сообщения (vk.com/dev/using_longpoll_2)
 * @return {Boolean}
 * @private
 */
function checkPmFlags (flag) {
  let flags = [33, 49, 545, 561];

  return !!~flags.indexOf(flag);
}

/**
 * Обрабатывает полученные обновления
 * @param  {Array} updatesArray 
 * @private
 *
 * Функции передаётся контекст (this) класса Messages (./Messages.js)
 */
function updatesProcessor (updatesArray) {
  // Пробегаемся по массиву обновлений
  for (let i = 0, len = updatesArray.length; i < len; i++) {
    let current = updatesArray[i];

    // Значение "4" в нулевом элементе массива => пришло новое сообщение. (https://vk.com/dev/using_longpoll)
    // Обрабатываем все сообщения, за исключением сообщений от бота.
    if (current[0] === 4 && ((current[7].from && parseInt(current[7].from) !== this.parent._botId) || checkPmFlags(current[2]))) {
      this.emit('longpoll_updates', {
        type:   'new_message', 
        target: messageAssembler(current)
      });

      continue;
    }

    // Друг current[1] стал оффлайн
    // if (current[0] === 9) {

    // }

    // Значение "51" в нулевом элементе массива свидетельствует о том, 
    // что информация беседы была изменена.
    if (current[0] === 51 && this._conversations[current[1]].users) {
      this.emit('longpoll_updates', {
        type:   'mchat_updated', 
        target: {
          mchatId: current[1]
        }
      });

      continue;
    }
  }
}

/**
 * Полностью обновляет LongPoll URL и подключается к серверу снова
 * @return {Promise}
 * @private
 *
 * Функции передаётся контекст (this) класса Messages (./Messages.js)
 */
function getLinkAndStartChecking () {
  debug.out('= Updating full LongPoll URL and starting checking again.');

  // Получаем данные для подключения к LongPoll серверу
  return this.parent.VKApi.call('messages.getLongPollServer')
    .then(response => {
      // Составляем URL
      let link = `https://${response.server}?act=a_check&wait=25&mode=2&key=${response.key}&ts=${response.ts}`;

      debug.out('+ URL was successfully got. Starting checking now.');

      return checker(link);
    })
    .catch(error => {
      debug.err('getLinkAndStartChecking()', error);

      return getLinkAndStartChecking.call(this);
    });
}

/**
 * Получает обновления от LongPoll сервера
 * @param  {String} link
 * @return {Promise}
 * @public
 *
 * Функции передаётся контекст (this) класса Messages (./Messages.js)
 */
function checker (link = null) {
  // Адрес сервера ещё не был получен - получаем.
  if (link === null) 
    return getLinkAndStartChecking.call(this);

  debug.out('+ Request to LongPoll Server was sent.');

  return prequest(link, { json: true })
    .then(response => {
      // Критическая ошибка в LongPoll-соединении (failed code >= 2). 
      // Нужно полностью обновить LongPoll-сессию (key и ts)
      if (response.failed && response.failed !== 1) 
        return getLinkAndStartChecking.call(this);

      // Обновление LongPoll URL (установка свежего timestamp)
      link = link.replace(/ts=.*/, 'ts=' + response.ts);

      // Никаких обновлений получено не было. 
      // Подключаемся по-новой
      if (!response.updates || response.updates.length < 1) 
        return checker(link);

      // Получены обновления. Обработаем их
      updatesProcessor.call(this, response.updates);

      // Подключаемся по-новой для прослушивания обновлений
      return checker(link);
    })
    .catch(error => {
      // Скорее всего, произошла одна из ошибок: ETIMEDOUT, EHOSTUNREACH, ESOCKETTIMEDOUT, ECONNRESET, ECONNREFUSED, ENOTFOUND, 502 code, etc. 
      // Переподключаемся. 
      // В логи ничего не пишем
      return getLinkAndStartChecking.call(this);
    });
}

module.exports = checker;