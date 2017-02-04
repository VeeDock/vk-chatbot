'use strict';

/**
 * Module dependencies.
 * @private
 */
const crypto         = require('crypto');
const prequest       = require('request-promise');
const router         = require('express').Router();
const redis          = require('../../../database/redis');
const captchaModule  = require('../../../bot/base/modules/captcha');

const config = require('../../../config');

router.get('/binary', (req, res) => {
  let sid = req.query.sid;

  // @todo: catch error
  return prequest('https://api.vk.com/captcha.php?sid=' + sid + '&s=1').pipe(res);
});

router.get('/', async (req, res) => {
  let activeCaptchas = await captchaModule.getActiveCaptchas();

  if (activeCaptchas && Object.keys(activeCaptchas).length) {
    activeCaptchas = Object.keys(activeCaptchas).map(key => ({
      id:  key, 
      sid: activeCaptchas[key]
    }));

    res.json({ response: activeCaptchas });

    return;
  }

  res.json({ response: [] });
});

router.post('/', async (req, res) => {
  let {
    auth_key, 
    captcha, 
    user_id
  } = req.body;

  let md5hash = crypto.createHash('md5').update(config.vk_group_app.id + '_' + user_id + '_' + config.vk_group_app.secret).digest('hex');

  let rkey = `captcha:key:${captcha.sid}:${captcha.id}`;
  let rval = captcha.key;

  if (md5hash === auth_key) 
    rval += ':' + user_id;

  await captchaModule.unsetActive({
    bot_id: captcha.id, 
    sid:    captcha.sid
  });
  await redis.call('setex', rkey, 10, rval);

  res.sendStatus(200);
});

module.exports = router;