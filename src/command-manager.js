'use strict';

const Eris = require('eris');
const Logger = require('./logger/logger');
const { readDirPromise } = require('./util');

const __options = {};

function __validateArguments(bot, logger, options) {
  if (!(bot instanceof Eris.Client)) {
    throw new TypeError('Command Manager did not recieve proper bot instance.');
  }

  if (!(logger instanceof Logger)) {
    throw new TypeError('Command Manager did not recieve proper logger instance.');
  }

  if (typeof options !== 'object') {
    throw new TypeError('Command Manager did not recieve a valid options object.');
  }

  const {
    commandDirectory = 'commands',
  } = options;

  if (typeof commandDirectory !== 'string' && commandDirectory.length < 1) {
    throw new TypeError('Message Handler recieved invalid commandDirectory name.');
  }

  return {
    bot: { bot },
    logger: { logger },
    options: {
      commandDirectory,
    },
  };
}

async function __getCommandsFromDirectory() {
  const commandDirectoryPath = `${__dirname}/${__options.commandDirectory}`;
  try {
    const files = await readDirPromise(commandDirectoryPath);
    const commands = [];
    files.forEach((file) => {
      if (file === 'base-command.js') return;
      const command = require(`${commandDirectoryPath}/${file}`);
      commands.push(command);
    });
    return commands;
  } catch (err) {
    throw err;
  }
}

function __generateAliasToCommandMap(commands = []) {
  const aliasToCommandMap = new Map();

  commands.forEach((command) => {
    const { aliases } = command.metadata;
    aliases.forEach((alias) => {
      aliasToCommandMap.set(alias, command);
    });
  });
  return aliasToCommandMap;
}

function __throwErrorForOverlappingAliases(commands = []) {
  const existingAlises = [];
  commands.forEach((command) => {
    const { aliases } = command.metadata;
    aliases.forEach((alias) => {
      if (existingAlises.includes(alias)) {
        throw new Error(`'${alias}' is not a unique alias.`);
      }
    });
    existingAlises.push(...aliases);
  });
}

function setPrivateOptions(options) {
  Object.assign(__options, options);
}


class CommandManager {
  constructor(bot, logger, options = {}) {
    const validatedArguments = __validateArguments(bot, logger, options);
    Object.assign(this, validatedArguments.bot);
    Object.assign(this, validatedArguments.logger);
    setPrivateOptions(validatedArguments.options);
    this.commands = [];
    this.reloadCommands();
  }

  async reloadCommands() {
    try {
      this.commands = await __getCommandsFromDirectory();
      __throwErrorForOverlappingAliases(this.commands);
      this.aliasToCommandMap = __generateAliasToCommandMap(this.commands);
    } catch (err) {
      this.logger.warn('Command Manager failed to reload commands. Reverting to old commands.');
      this.logger.warn(err.message);
    }
  }

  getCommandFromAlias(alias = '') {
    return this.aliasToCommandMap.get(alias);
  }
}

module.exports = CommandManager;
