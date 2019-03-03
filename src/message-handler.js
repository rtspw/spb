'use strict';

const Eris = require('eris');
const Logger = require('./logger/logger');
const CommandManager = require('./command-manager');

function __validateArguments(bot, logger, options) {
  if (!(bot instanceof Eris.Client)) {
    throw new TypeError('Message Handler did not recieve proper bot instance.');
  }

  if (!(logger instanceof Logger)) {
    throw new TypeError('Message Handler did not recieve proper Logger instance.');
  }

  if (typeof options !== 'object') {
    throw new TypeError('Message Handler did not recieve a valid options object.');
  }

  const {
    defaultPrefix = 's.',
    adminIDs = [],
    commandDirectory = 'commands',
  } = options;

  if (typeof defaultPrefix !== 'string' || defaultPrefix.length < 1) {
    throw new TypeError('Default prefix must be a string of at least one character.');
  }

  if (!(adminIDs instanceof Array)) {
    throw new TypeError('Admin IDs must be an array.');
  }

  adminIDs.forEach((id) => {
    if (typeof id !== 'string') {
      throw new TypeError('Admin IDs must be an array of strings.');
    }
  });


  return {
    bot,
    logger,
    options: {
      defaultPrefix, adminIDs,
    },
    commandManagerOptions: {
      commandDirectory,
    },
  };
}

class MessageHandler {
  constructor(bot, logger, options = {}) {
    const validatedOptions = __validateArguments(bot, logger, options);
    Object.assign(this, validatedOptions);
    this.commandManager = new CommandManager(this.bot, this.logger, this.commandManagerOptions);
  }

  async handle(discordMessage) {
    // Send through hooks

    // Get command processing function through command processor if exists
    const { content } = discordMessage;
    const command = this.commandManager.getCommandFromAlias(content);
    if (command !== undefined) {
      try {
        await command.run(discordMessage);
      } catch (err) {
        this.logger.error(`Could not execute command '${content}' properly.`);
        this.logger.error(err.message);
      }
    }

    // Get meta-command processing function through command processor if exists
    return this;
  }
}

module.exports = MessageHandler;
