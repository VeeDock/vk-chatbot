'use strict';

/**
 * Module dependencies.
 * @private
 */
const fs     = require('fs');
const async  = require('async');
const VKApi  = require('node-vkapi');
const config = require('../../config');

/**
 * Авторизует бота, используя данные из `account`.
 * @param  {Object} account
 * @private
 */
async function authenticate (account) {
  let opts = { auth: account.auth };
  let VK   = new VKApi(opts);

  return await VK.auth.user({ scope: config.bot.scope, type: 'android' }).then(token => ({ [token.user_id]: token.access_token }));
}

/**
 * Авторизует ботов, перечисленных в `accounts`.
 * @param  {Object}  accounts
 * @param  {Object}  options
 * @return {Promise}           Объект { <user_id>: <access_token> }
 * @public
 */
async function authenticator (accounts, options) {
  if (fs.existsSync(config.path.tokens)) 
    return require(config.path.tokens);

  let tokens = await Promise.all(Object.keys(accounts).map(async id => {
    let authData   = accounts[id];
    let initObject = Object.assign({}, authData, { id });

    return await authenticate(initObject);
  }));

  tokens = tokens.reduce((ret, cur) => Object.assign(ret, cur), {});

  // Сохраняем обновлённый список токенов.
  fs.writeFileSync(config.path.tokens, JSON.stringify(tokens));

  return tokens;
}

module.exports = authenticator;