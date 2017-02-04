'use strict';

/**
 * Module dependencies.
 * @private
 */
const router    = require('express').Router();
const HttpError = require('../errors/http-error');

router.use('/app', require('./app'));
router.use('/captcha', require('./captcha'));
router.use('/', require('./main'));

// Catch 404 and forward to error handler.
router.use((req, res, next) => next(new HttpError(404)));

// Error handler.
router.use((err, req, res, next) => {
  let errorObject = req.app.get('env') === 'development' ? err : { message: err.message };

  res.status(err.status || 500);
  res.json(Object.assign({
    success: false
  }, errorObject));
});

module.exports = router;