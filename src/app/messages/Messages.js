'use strict';

/**
 * Module dependencies.
 * @private
 */
const EventEmitter = require('events').EventEmitter;
const config       = require('../../config');
const debug        = require('../../lib/simple-debug')(__filename);
const longpolling  = require('./longpolling');
const processing   = require('./processing');
const Queue        = require('./queue');

/**
 * Преобразует полученный массив участников беседы (messages.getChatUsers) в объект. 
 * @param  {Array}    array   Исходный массив
 * @param  {Number}   botId   ID бота
 * @return {Object}
 * @private
 *
 * Вид возвращаемого объекта:
 * {
 *   <user_id>: {
 *     firstName:    String, 
 *     lastName:     String, 
 *     chatAdmin:    Boolean, 
 *     botInviter:   Boolean, 
 *     invitedByBot: Boolean
 *   }
 * }
 */
function chatUsersArrayToObj (array, botId) {
  let obj = {};
  let botInviter = null;

  for (let i = 0, len = array.length; i < len; i++) {
    let current = array[i];

    obj[current.id] = {
      firstName: current.first_name, 
      lastName: current.last_name
    }

    if (current.id === botId && current.id !== current.invited_by) 
      botInviter = current.invited_by;

    if (current.id === current.invited_by) 
      obj[current.id].chatAdmin = true;

    if (current.id !== botId && current.invited_by === botId) 
      obj[current.id].invitedByBot = true;
  }

  // Если пригласивший бота пользователь присутствует в беседе, 
  // указываем, что именно он пригласил бота
  if (botInviter != null && obj[botInviter] != undefined) 
    obj[botInviter].botInviter = true;

  return obj;
}

/**
 * Базовый класс для работы с сообщениями.
 */
class Messages extends EventEmitter {
  constructor (parent) {
    super();

    // Ссылка на экземпляр класса Bot (../bot/Bot.js)
    this.parent = parent;

    // Класс для работы с очередью сообщений
    this.Queue = new Queue();

    /**
     * Информация о диалогах. 
     *
     * Формат записи свойств:
     *   <chat_id>: {
     *     users:            [users_object], 
     *     mode:             [chat_mode],
     *     botsCheckingTime: [bots_checking], 
     *     lastMessage:      String, 
     *     [_votes] (/vote)
     *   }
     *
     * [users_object] Object (undefined for personal chats) {
     *   <user_id>: {
     *     firstName:    String, 
     *     lastName:     String, 
     *     chatAdmin:    Boolean, 
     *     botInviter:   Boolean, 
     *     invitedByBot: Boolean
     *   }
     * } or null if bot has leaved by himself
     *
     * [chat_mode] String (undefined for personal chats)
     *   undefined or 'default' : default chat mode
     *   'vote'                 : voting mode (/vote)
     *
     * [bots_checking] Number (undefined for personal chats)
     * 
     * @private
     */
    this._conversations = new Proxy({}, {
      // Перехватываем обращение к несуществующему свойству 
      // "prop", где prop = chat_id
      get: function (target, prop) {
        if (target[prop] === undefined) 
          target[prop] = {};
        
        return target[prop];
      }
    });

    /**
     * Timestamp последнего успешно отправленного сообщения.
     * @type {Number}
     * @private
     */
    this._lastMessageTime = 0;
  }

  /**
   * Обновляет список участников беседы.
   * @param  {Number} chat_id ID беседы
   * @return {Promise}
   * @private
   */
  _updateChatComp (chat_id) {
    return this.parent.VKApi.call('messages.getChatUsers', { chat_id, fields: 'first_name' })
      .then(response => {
        // Бота уже нет в беседе. Очищаем информацию о чате
        if (response.length === 0) {
          // 1. Удаляем всю информацию о чате (список участников, последнее сообщение и пр.)
          delete this._conversations[chat_id];

          // 2. Удаляем сообщения в этот чат из очереди
          // В случае, если бота кикнули (это отследить можно только проверив response.length === 0), 
          // то сообщение в любом случае не отправится. Даже если оно не удалится из очереди.
          // Но, на всякий случай, сообщения всё-таки удаляются, дабы очистить очередь.
          this.Queue.clear(chat_id);

          return;
        }

        // Сохраняем полученный список участников
        this._conversations[chat_id].users = chatUsersArrayToObj(response, this.parent._botId);
      })
      .catch(error => {
        // Internal server error or Too many requests error
        if (error.name === 'VKApiError' && (error.code === 10 || error.code === 6)) 
          return;

        debug.err('Error in _updateChatComp', error);

        // Снова пытаемся получить список участников
        return this._updateChatComp(chat_id);
      });
  }

  /**
   * "Цикл" проверки обновлений с LongPoll сервера, а также
   * обработка полученных результатов и отправка сообщений
   * @private
   */
  _updatesLoop () {
    /**
     * Установим обработчик на событие "longpoll_updates". 
     * Обработанные массивы обновлений из LongPolling попадают сюда. 
     * @param  {Object} event
     *   @property {String} type
     *   @property {Object} target
     *
     * Возможные типы событий:
     *   1. 'new_message'   - пришло новое сообщение;
     *   2. 'mchat_updated' - изменения в мультичате (название беседы, изменения в составе)
     */
    this.on('longpoll_updates', event => {
      let { type, target } = event;

      // Пришло новое сообщение.
      if (type === 'new_message') {
        debug.out('= Message received.');

        // Предыдущее сообщение в данном диалоге.
        let prevMessage = (this._conversations[target.dialogId].lastMessage || '').toLowerCase();

        // Не обрабатываем сообщение, если оно идентично предыдущему.
        if (target.message.toLowerCase() === prevMessage) 
          return;

        // Если пользователь, написавший сообщение, заблокирован, то 
        // сообщение обработано не будет. 
        if (this.parent.parent._databases['banned'].data.includes(target.fromId)) 
          return;

        // Сохраняем последнее сообщение в диалоге.
        this._conversations[target.dialogId].lastMessage = target.message;

        // Участники текущей беседы ещё не были загружены, поэтому получим их прямо сейчас.
        if (target.isMultichat && !this._conversations[target.mchatId].users) 
          this._updateChatComp(target.mchatId);

        // Обработаем полученное сообщение (выполним команды / ответим на сообщение)
        processing.call(this, target);

        return;
      }

      // Произошли изменения в беседе
      if (type === 'mchat_updated') {
        debug.out('= Multichat updates.');

        // Обновляем список участников
        this._updateChatComp(target.mchatId);

        return;
      }
    });

    debug.out('+ LongPolling listener was set');
    debug.out('+ LongPolling checking was started');

    // Подключаемся к LongPoll серверу и проверяем обновления
    longpolling.call(this);
  }

  /**
   * "Цикл" проверки очереди сообщений. 
   * Если она не пуста, то отправляется первое сообщение из очереди
   * @private
   */
  _queueLoop () {
    let queue = this.Queue;

    // Если очередь не пуста
    if (!queue.isEmpty()) {
      // Берём из неё первое сообщение
      let message = queue.dequeue();

      // Если список юзеров === null, значит, бот ушёл сам из чата chat_id. 
      // В таком случае, сообщение не отправляем
      if (message && message.chat_id && this._conversations[message.chat_id].users === null) {
        // Удаляем информацию о чате
        delete this._conversations[message.chat_id];

        // Удаляем сообщения из очереди в этот чат
        this.Queue.clear(message.chat_id);

        return setTimeout(() => this._queueLoop(), config.messages.delay);
      }

      return this._send(message)
        .then(() => {
          // Обновим timestamp последнего успешно отправленного сообщения
          this._lastMessageTime = Date.now();

          return setTimeout(() => this._queueLoop(), config.messages.delay);
        })
        .catch(error => {
          debug.err('- Error in Messages._queueLoop()', error);

          return setTimeout(() => this._queueLoop(), config.messages.delay);
        });
    }

    return setTimeout(() => this._queueLoop(), config.messages.delay);
  }

  /**
   * Отправляет сообщения во ВКонтакте.
   * @param  {Object} messageObj Объект сообщения
   * @return {Promise}
   * @private
   */
  _send (messageObj) {
    if (messageObj === null) 
      return Promise.resolve();

    return this.parent.VKApi.call('messages.send', messageObj)
      .catch(error => {
        // Флуд-контроль. 
        // Добавляем в конец сообщения смайлик и отправляем запрос снова.
        if (error.name === 'VKApiError' && error.code === 9) {
          messageObj.message = messageObj.message + ' 😊';

          return this._send(messageObj);
        }

        // Внутрення серверная ошибка, отправлять по-новой ничего не будем.
        if (error.name === 'VKApiError' && error.code === 10) 
          return;

        debug.err('Messages.send()', error);
      });
  }

  /**
   * Устанавливает режим беседы.
   * @param {String} mode Режим
   * @public
   */
  setChatMode (chatId, mode) {
    this._conversations[chatId].mode = mode;
  }

  /**
   * Возвращает значение режима беседы.
   * @param  {Number} chatId ID беседы
   * @return {String}
   * @public
   */
  getChatMode (chatId) {
    return this._conversations[chatId].mode;
  }

  /**
   * Запускает модуль сообщений:
   *   1. Активируется цикл проверки сообщений в очереди для отправки;
   *   2. Активируется цикл проверки новых сообщений через LongPoll.
   * @public
   */
  start () {
    this._updatesLoop();
    this._queueLoop();
  }
}

module.exports = Messages;