'use strict';

/**
 * Module dependencies.
 * @private
 */
const Schema     = require('mongoose').Schema;
const connection = require('../mongo');
const redis      = require('../redis');

const UserSchema = new Schema({
  // ID Вконтакте
  id: {
    type:     Number, 
    unique:   true, 
    required: true
  }, 

  // Количество поинтов, которые можно тратить на команды
  points_count: {
    type:    Number, 
    default: 0
  }, 

  is_admin:  {
    type:    Boolean, 
    default: false
  }, 

  is_banned: {
    type:    Boolean, 
    default: false
  }
}, { versionKey: false });

// @todo: Log errors

UserSchema.static('get', async function (id) {
  let cachedUser = await redis.call('hgetall', 'user:' + id);

  if (cachedUser && Object.keys(cachedUser).length) {
    let userObject = UserModel(cachedUser).toObject();

    delete userObject._id;

    return userObject;
  }

  let user = await this.findOneAndUpdate({ id }, {}, { upsert: true, new: true, setDefaultsOnInsert: true }).then(response => {
    let result = response.toObject();

    delete result._id;

    return result;
  }).catch(error => null);

  if (user) 
    await redis.call('hmset', 'user:' + id, user);

  return user;
});

UserSchema.static('upd', async function (id, update) {
  let user = await this.findOneAndUpdate({ id }, update, { upsert: true, new: true, setDefaultsOnInsert: true }).then(response => {
    let result = response.toObject();

    delete result._id;

    return result;
  }).catch(error => null);

  if (user) 
    await redis.call('hmset', 'user:' + id, user);

  return user;
});

const UserModel = connection.model('User', UserSchema);

module.exports = UserModel;