'use strict';

const Eris = require('eris');
const Logger = require('./logger/logger');

function __validateArguments(bot, logger, options) {
  if (!(bot instanceof Eris.Client)) {
    throw new Error('Message Handler did not recieve proper bot instance.');
  }

  if (!(logger instanceof Logger)) {
    throw new Error('Message Handler did not recieve proper logger instance.');
  }

  return {
    bot, logger, options,
  };
}

class MessageHandler {
  constructor(bot, logger, options = {}) {
    console.info('INIT:', 'Setting up message handler.');
    const validatedArguments = __validateArguments(bot, logger, options);
    Object.assign(this, validatedArguments);
  }

  handle(message) {
    // Send through hooks
    // Get command processing function through command processor if exists
    // Get meta-command processing function through command processor if exists
    this.logger.info(`Recieved message: ${message.content} - ${message.author.username}`);
  }
}

module.exports = MessageHandler;
