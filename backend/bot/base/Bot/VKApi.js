'use strict';

/**
 * Module dependencies.
 * @private
 */
const VKApi   = require('node-vkapi');
const Captcha = require('./Captcha');

// Subscribe to channels.
Captcha._subscribe();

class Api {
  constructor (params, bot_id) {
    this.bot_id   = bot_id;
    this.instance = new VKApi(params);

    /**
     * "Замороженные" методы: нужен ввод капчи.
     * @type {Set}
     */
    this.frozenMethods = new Set();
  }

  /**
   * "node-vkapi" .call() wrapper
   */
  call (method, params) {
    // Метод "заморожен" до ввода капчи.
    if (this.frozenMethods.has(method)) 
      return Promise.reject();

    return this.instance.call(method, params)
      .catch(async error => {
        if (error.code === 14) {
          // "Заморозим" метод на время, т.к. его всё равно нельзя 
          // будет использовать до ввода капчи.
          this.frozenMethods.add(method);

          const captchaSid = error.ext.captcha_sid;
          const captchaKey = await Captcha.addAndWait(this.bot_id, captchaSid);

          // "Разморозим" метод, т.к. ввод капчи, скорее всего, больше не нужен.
          this.frozenMethods.delete(method);

          // Капчу не разгадали за 10 минут, попробуем выполнить запрос снова.
          if (!captchaKey) 
            return this.call(method, params);

          // Капча была разгадана, отправляем запрос вместе с кодом с картинки.
          return this.call(
            method, 
            Object.assign(
              params, 
              {
                captcha_sid: captchaSid, 
                captcha_key: captchaKey
              }
            )
          );
        }

        throw error;
      });
  }

  // @todo: same as "call"
  upload (type, params) {
    return this.instance.upload(type, params)
      .catch(error => {

      });
  }
}

module.exports = Api;