'use strict';

module.exports = (condition = '') => {
  if (condition) 
    return require('./conditions/' + condition);

  return require('./main');
};