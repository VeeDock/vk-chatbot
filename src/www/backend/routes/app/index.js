'use strict';

/**
 * Module dependencies.
 * @private
 */
const crypto = require('crypto');
const path   = require('path');
const router = require('express').Router();

const config = require('../../../config');

router.get('/', (req, res) => {
  let {
    api_id, 
    auth_key, 
    sign, 
    viewer_id
  } = req.query;

  // Check auth_key
  let md5hash = crypto.createHash('md5').update(api_id + '_' + viewer_id + '_' + config.vk_group_app.secret).digest('hex');

  if (md5hash !== auth_key) {
    res.status(403).send('You are not authorized.');

    return;
  }

  let sha256hash = crypto.createHmac('sha256', config.vk_group_app.secret);

  for (let key of Object.keys(req.query)) {
    if (key === 'hash' || key === 'api_result' || key === 'sign') 
      continue;

    sha256hash.update(req.query[key]);
  }

  sha256hash = sha256hash.digest('hex');

  if (sha256hash !== sign) {
    res.status(403).send('Request signature is wrong.');

    return;
  }

  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

module.exports = router;