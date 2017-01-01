'use strict';

/**
 * Module dependencies.
 * @private
 */
const fs   = require('fs');
const path = require('path');

/**
 * Возвращает массив отфильтрованных команд для текущего бота.
 * 
 * Формат записи данных:
 * [
 *   {
 *     command: <Название команды>, 
 *     <...свойства объекта команды> (aliases, unique, run, description, use, mask)
 *   }
 * ]
 * 
 * @param  {String} cmdPath Абсолютный путь к папке, где находятся команды
 * @return {Array}
 * @private
 */
function getCommandFiles (cmdPath) {
  let files  = fs.readdirSync(cmdPath);
  let output = [];

  // Обрабатываем все файлы из папки cmdPath
  for (let i = 0, len = files.length; i < len; i++) {
    let currentFile = files[i];

    // Текущий файл не подходит
    if (!currentFile.endsWith('.js') || currentFile.startsWith('_')) 
      continue;

    let filename    = currentFile.slice(0, -3);
    let commandFile = require(path.join(cmdPath, filename));

    // Оставляем только включенные команды, а также те, которые экспортируют функцию в <cmd>.run.
    if (commandFile.enabled && typeof commandFile.run === 'function') {
      let objToPush = Object.assign({ command: filename }, commandFile);

      delete objToPush.enabled;

      output.push(objToPush);
    }
  }

  return output;
}

/**
 * Возвращает массив команд для текущего бота. 
 * @param  {Object}
 *   @property {Number}  id             ID бота
 *   @property {Boolean} exclusiveOnly  Вернуть только эксклюзивные команды?
 * @return {Array}
 * @public
 */
function getCommands ({ id/*, exclusiveOnly*/ }) {
  let cmdPath   = path.join(process.cwd(), './app/messages/parsers/commands');
  let commands_ = getCommandFiles(cmdPath);

  return /*exclusiveOnly ? exclusive_ : */commands_;
}

module.exports = getCommands;