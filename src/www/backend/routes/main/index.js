'use strict';

/**
 * Module dependencies.
 * @private
 */
const path   = require('path');
const router = require('express').Router();

router.get('*', (req, res) => res.redirect('/app'));

module.exports = router;