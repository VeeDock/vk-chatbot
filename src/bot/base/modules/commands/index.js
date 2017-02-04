'use strict';

/**
 * Module dependencies.
 * @private
 */
const fs   = require('fs');
const path = require('path');

const config = require('../../../../config');

/**
 * Получает список команд.
 * @return {Array} [{
 *   name:       <command_name>,      // String
 *   aliases:    <command_aliases>,   // Array
 *   private:    <command_private>,   // Boolean
 *   uniqueness: <command_uniqueness> // String
 * }]
 */
function getList () {
  let files  = fs.readdirSync(config.path.commands);
  let output = [];

  for (let filename of files) {
    if (!filename.endsWith('.js') || filename.startsWith('_')) 
      continue;

    let commandName = filename.slice(0, -3);
    let commandFile = require(path.join(config.path.commands, commandName));

    if (typeof commandFile.run === 'function') {
      output.push({
        name:       commandName, 
        aliases:    commandFile.aliases || [], 
        private:    commandFile.private || false, 
        uniqueness: commandFile.uniqueness || ''
      });
    }
  }

  return output;
}

module.exports = {
  getList
};