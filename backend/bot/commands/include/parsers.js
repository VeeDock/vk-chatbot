'use strict';

/**
 * Module dependencies.
 * @private
 */
const cheerio = require('cheerio');
const qs      = require('querystring');

module.exports = {
  parseStavKlassImgUrl (rbody) {
    return new Promise((resolve, reject) => {
      let $ = cheerio.load(rbody);
      let image = $('a.image');

      if (image.length === 0) 
        return reject(new Error('Не удалось спарсить изображение'));

      let imageUrl = image.eq(0).find('img').attr('src');

      return resolve(imageUrl);
    });
  }
}