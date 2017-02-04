'use strict';

/**
 * Module dependencies.
 * @private
 */
const http = require('http');

class HttpError extends Error {
  constructor (status, message = '') {
    let errorMessage = message || http.STATUS_CODES[status] || 'HTTP Error';

    super(errorMessage);

    this.status = status;
  }
}

HttpError.prototype.name = 'HttpError';

module.exports = HttpError;