'use strict';

/**
 * Module dependencies.
 * @private
 */
const async = require('async');
const VKApi = require('node-vkapi');

const User  = require('../../database/models/user');

const captcha          = require('./modules/captcha');
const commands         = require('./modules/commands');
const executables      = require('./modules/executables');
const longpoll         = require('./modules/longpoll');
const messageProcessor = require('./modules/messages/processor');
const messageSender    = require('./modules/messages/sender');
const Queue            = require('./modules/queue');

const accounts = require('../../config/accounts');
const config   = require('../../config');

class Application {
  constructor () {
    // this._api      = { <bot_id>: VKApi instance, ... }
    // this._commands = [{ ... }, ...]
    // this._queue    = { <bot_id>: Queue instance, ... }
  }

  static initialize (tokens) {
    let app = new Application();

    app._api      = {};
    app._commands = commands.getList();
    app._queue    = {};

    for (let id of Object.keys(tokens)) {
      let token = tokens[id];

      app._api[id]   = new VKApi({ token });
      app._queue[id] = new Queue();
    }

    return app;
  }

  get (key, _id) {
    return _id ? (this['_' + key][_id] || this['_' + key]) : this['_' + key];
  }

  start () {
    let apis   = this.get('api');
    let queues = this.get('queue');

    longpoll
      .start(apis)
      .on('message', data => messageProcessor({
        id:   data.id, 
        data: data.data, 
        app:  this
      }))
      //.on('mchat_updates', data => {});

    for (let id of Object.keys(queues)) {
      let api = apis[id];

      // Queue loop.
      (function queueLoop (user_id) {
        let userWhoRecognizedCaptcha = user_id;

        async.forever(
          next => {
            let queue = queues[id];

            if (queue.isEmpty()) 
              return setTimeout(() => next(), config.bot.messages_delay);

            let message = queue.dequeue();

            if (!message) 
              return next();

            messageSender(message, api)
              .then(async () => {
                // Капча была разгадана верно, раз сообщение отправилось. 
                // Добавим юзеру поинтов.
                if (userWhoRecognizedCaptcha) {
                  await User.upd(userWhoRecognizedCaptcha, { $inc: { points_count: 10 } });

                  userWhoRecognizedCaptcha = null;
                }

                return setTimeout(() => next(), config.bot.messages_delay);
              })
              .catch(captchaError => {
                // @todo: count user's wrong captcha keys
                // if (userWhoRecognizedCaptcha) { userWhoRecognizedCaptcha = null; }

                return next({
                  message, 
                  captcha_sid: captchaError.ext.captcha_sid
                });
              });
          }, 

          // Прерываем отправление сообщений из очереди до ввода капчи.
          async errback => {
            let messageObject = errback.message;
            let captchaSid    = errback.captcha_sid;

            await captcha.setActive({
              bot_id: id, 
              sid:    captchaSid
            });

            let waitTime = -1;

            async.forever(
              // Каждую секунду проверяем, не разгадана ли капча.
              async nxt => {
                let captchaKey = await captcha.getKey({
                  bot_id: id, 
                  sid:    captchaSid
                });

                if (!captchaKey) {
                  waitTime += 1;

                  // Ждем уже более 10 минут. 
                  // Попробуем отправить сообщение без ввода капчи.
                  if (waitTime >= 600) {
                    await captcha.unsetActive({
                      bot_id: id, 
                      sid:    captchaSid
                    });

                    return nxt('no_captcha');
                  }

                  return setTimeout(() => nxt(), 1000);
                }

                return nxt(captchaKey);
              }, 

              captchaKey => {
                let key;
                let userId;

                if (captchaKey === 'no_captcha') {
                  key = null;
                } else if (captchaKey.includes(':')) {
                  // <key>:<user_id>
                  key = captchaKey.split(':')[0];
                  userId = parseInt(captchaKey.split(':')[1]);
                } else {
                  key = captchaKey;
                }

                let captchaObject = !key ? {} : {
                  captcha_sid: captchaSid, 
                  captcha_key: key
                };
                let objToSend = Object.assign({}, messageObject, captchaObject);

                queues[id].enqueueTo(0, objToSend);

                return queueLoop(userId);
              }
            );

            return;
          }
        );

        return;
      })();

      // Status loop.
      async.forever(next => {
        api.call('execute', { code: executables.status('Online') })
        .then(response => setTimeout(() => next(), config.bot.status_delay))
        .catch(error => {
          console.log('status loop', error);
          return setTimeout(() => next(), 1000 * 10);
        });
        // @todo: Log error
      });

      // Friends loop.
      async.forever(next => {
        api.call('execute', { code: executables.friends(accounts[id].condition) })
        .then(response => setTimeout(() => next(), config.bot.friends_delay))
        .catch(error => {
          console.log('friends loop', error);
          return setTimeout(() => next(), 1000 * 10);
        });
        // @todo: Log error
      });
    }
  }

  /**
   * 
   * @public
   */
  async stop () {
    await require('../../database/redis').quit();
    await require('../../database/mongo').close();

    let apis      = this.get('api');
    let notOffile = [];

    await Promise.all(Object.keys(apis).map(async id => {
      let api = apis[id];

      return await api.call('execute', { code: executables.status('Offline') })
        .catch(error => notOffile.push(accounts[id].name));
    }));

    if (notOffile.length) 
      console.log(`These bots are not offline: ${notOffile.join(', ')}`);

    return 'ok';
  }
}

module.exports = Application;