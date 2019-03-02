'use strict';

const Eris = require('eris');
const { readDirPromise } = require('./util');

const __options = {};

function __validateArguments(bot, options) {
  if (!(bot instanceof Eris.Client)) {
    throw new Error('Message Handler did not recieve proper bot instance.');
  }

  if (typeof options !== 'object') {
    throw new Error('Message Handler did not recieve a valid options object.');
  }

  const {
    commandDirectory = 'commands',
  } = options;

  if (typeof commandDirectory !== 'string' && commandDirectory.length < 1) {
    throw new Error('Message Handler recieved invalid commandDirectory name.');
  }

  return {
    bot,
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
      const command = require(`${commandDirectoryPath}/${file}`);
      commands.push(command);
    });
    return commands;
  } catch (err) {
    throw err;
  }
}

function __generateAliasToCommandMap(commands = []) {
  const aliasToIDMap = new Map();

  commands.forEach((command) => {
    const { aliases } = command.metadata;
    aliases.forEach((alias) => {
      aliasToIDMap.set(alias, command);
    });
  });
  return aliasToIDMap;
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
  constructor(bot, options = {}) {
    console.info('INIT:', 'Setting up command manager.');
    const validatedArguments = __validateArguments(bot, options);
    Object.assign(this, validatedArguments.bot);
    setPrivateOptions(validatedArguments.options);
    this.reloadCommands();
  }

  async reloadCommands() {
    try {
      this.commands = await __getCommandsFromDirectory();
      __throwErrorForOverlappingAliases(this.commands);
      this.aliasToCommandMap = __generateAliasToCommandMap(this.commands);
    } catch (err) {
      console.error('ERROR:', 'Command Manager failed to reload commands.');
      console.error('ERROR:', err.message);
    }
  }
}

module.exports = CommandManager;
