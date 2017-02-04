'use strict';

async function run ({ id, app, args, options, user }) {
  return '/id' + user.id + '\n' + 
         'Баланс: ' + user.points_count;
}

module.exports = {
  help_text: '/me\n\nИнформация о пользователе.', 
  run
}