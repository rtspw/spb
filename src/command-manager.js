'use strict';

const Eris = require('eris');
const fs = require('fs');

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

function __getCommandsFromDirectory() {
  // fs.readdirSync(`${__dirname}/${__options.commandDirectory}`);
}

function setPrivateOptions(options) {
  Object.assign(__options, options);
}


class CommandManager {
  constructor(bot, options = {}) {
    const validatedArguments = __validateArguments(bot, options);
    Object.assign(this, validatedArguments.bot);
    setPrivateOptions(validatedArguments.options);
    this.reloadCommands();
  }

  reloadCommands() {
    this.commands = __getCommandsFromDirectory();
  }
}

module.exports = CommandManager;
