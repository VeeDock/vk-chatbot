'use strict';

/**
 * Класс, реализующий работу очереди сообщений
 */
class Queue {
  /**
   * Очередь сообщений
   * 
   * Формат записи элемента массива:
   *   [
   *     [chatId, message]
   *   ]
   */
  constructor () {
    this.queue = [];
  }

  /**
   * Помещает сообщение в конец очереди
   * @param  {Object} message Объект сообщения
   * @public
   */
  enqueue (message) {
    let conversationId = message.chat_id || message.user_id;

    /**
     * Если в очереди есть сообщение в диалог conversationId, 
     * то добавляем к нему ещё одно и выходим из функции.
     * 
     * Если такого conversationId в очереди не оказалось, 
     * то добавляем новое сообщение в очередь (по завершению цикла)
     * 
     * * Только для сообщений без прикреплений 
     */
    if (!message.attachment && !message.captcha_key) {
      // Пробегаемся по очереди и находим нужный conversationId
      for (let i = 0, len = this.queue.length; i < len; i++) {
        // Убедимся, что в сообщении нет прикреплений
        if (this.queue[i] && this.queue[i][0] === conversationId && !this.queue[i][1].attachment) {
          // Объединяем текущее сообщение с найденным сообщением в очереди
          this.queue[i][1].message          += '\n\n' + message.message;
          this.queue[i][1].forward_messages += ',' + message.forward_messages;

          return;
        }
      }
    }

    // Если же сообщение содержит прикрепления, либо для данного сообщения не было 
    // найдено подходящее сообщение в очереди (без прикреплений), то добавляем новый массив в конец очереди.
    this.queue.push([conversationId, message]);
  }

  /**
   * Помещает сообщение в очередь на место index
   * @param  {Number} index   Позиция
   * @param  {Object} message Объект сообщения
   * @public
   */
  enqueueTo (index, message) {
    let conversationId = message.chat_id || message.user_id;

    /**
     * В случае с указанным местом в очереди, пробегаемся не по 
     * всему массиву, а только с 0 до index места. 
     *
     * При этом, удостоверимся, что index < длины очереди, ибо иначе код внутри блока 
     * не имеет смысла.
     *
     * Случай с прикрплениями аналогичный функции this.enqeque()
     */
    if (!message.attachment && !message.captcha_key) {
      let len = index < this.queue.length ? index + 1 : this.queue.length;
      for (let i = 0; i < len; i++) {
        if (this.queue[i] && this.queue[i][0] === conversationId && !this.queue[i][1].attachment) {
          this.queue[i][1].message          += '\n\n' + message.message;
          this.queue[i][1].forward_messages += ',' + message.forward_messages;

          return;
        }
      }
    }

    this.queue.splice(index, 0, [conversationId, message]);
  }

  /**
   * Удаляет первый элемент из очереди и возвращает его.
   * @public
   */
  dequeue () {
    let item = this.queue.shift();

    return item && item[1] || null;
  }

  /**
   * Удаляет сообщения в чат chatId из очереди
   * @param  {Number} chatId ID чата
   * @public
   */
  clear (chatId) {
    let i   = 0;
    let len = this.queue.length;

    // Пробегаемся по очереди и удаляем из неё сообщения для чата chatId.
    while (i++ < len) 
      if (this.queue[i] && this.queue[i][0] === chatId) 
        this.queue[i] = null;
  }

  /**
   * Вёрнет true, если очередь пуста.
   * @return {Boolean}
   * @public
   */
  isEmpty () {
    return this.queue.length === 0;
  }
}

module.exports = Queue;