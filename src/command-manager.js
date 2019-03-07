'use strict';

const Eris = require('eris');
const Logger = require('./logger/logger');
const Command = require('./command');
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
    adminIDs = [],
    commandDirectory = 'commands',
  } = options;


  if (!(adminIDs instanceof Array)) {
    throw new TypeError('Admin IDs must be an array.');
  }

  adminIDs.forEach((id) => {
    if (typeof id !== 'string') {
      throw new TypeError('Admin IDs must be an array of strings.');
    }
  });

  if (typeof commandDirectory !== 'string' && commandDirectory.length < 1) {
    throw new TypeError('Message Handler recieved invalid commandDirectory name.');
  }

  return {
    bot: { bot },
    logger: { logger },
    options: {
      adminIDs,
      commandDirectory,
    },
  };
}

function __emptyRequireCache(files = []) {
  files.forEach((file) => {
    const filePath = require.resolve(`./${__options.commandDirectory}/${file}`);
    delete require.cache[filePath];
  });
}

async function __getCommandInfoFromDirectory() {
  const commandDirectoryPath = `${__dirname}/${__options.commandDirectory}`;
  const files = await readDirPromise(commandDirectoryPath);
  __emptyRequireCache(files);
  const commandsInfo = [];
  files.forEach((file) => {
    const commandInfo = require(`${commandDirectoryPath}/${file}`);
    commandsInfo.push(commandInfo);
  });
  return commandsInfo;
}

function __wrapCommandsInfoIntoCommandObjects(commandsInfo = []) {
  const commands = [];
  commandsInfo.forEach((commandInfo) => {
    const command = new Command(commandInfo.run, commandInfo.metadata, commandInfo.hooks, __options);
    commands.push(command);
  });
  return commands;
}

async function __getCommandsFromDirectory(commandManager) {
  try {
    const commandsInfo = await __getCommandInfoFromDirectory();
    const commands = await __wrapCommandsInfoIntoCommandObjects(commandsInfo);
    return commands;
  } catch (err) {
    commandManager.logger.warn('Failed to initialize commands from directory.');
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

function __attachOtherObjectsToCommands(commandManager) {
  const { commands } = commandManager;
  commands.forEach((command) => {
    const {
      usesBot = false,
      usesLogger = false,
      usesCommandManager = false,
    } = command.metadata;

    if (usesBot) {
      command.useBot(commandManager.bot);
    }

    if (usesLogger) {
      command.useLogger(commandManager.logger);
    }

    if (usesCommandManager) {
      command.useCommandManager(commandManager);
    }
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
      this.commands = await __getCommandsFromDirectory(this);
      __throwErrorForOverlappingAliases(this.commands);
      __attachOtherObjectsToCommands(this);
      this.aliasToCommandMap = __generateAliasToCommandMap(this.commands);
      this.logger.info('Command Manager has reloaded commands successfully.');
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
