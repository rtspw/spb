'use strict';

const Eris = require('eris');

function __validateArguments(bot, options) {
  if (!(bot instanceof Eris.Client)) {
    throw new Error('Message Handler did not recieve proper bot instance.');
  }

  
}

class MessageHandler {
  constructor(bot, options = {}) {
    console.info('INIT:', 'Setting up message handler.');
    const validatedOptions = __validateArguments(bot, options);
    Object.assign(this, validatedOptions);
  }

  handle(message) {
    // Send through hooks
    // Get command processing function through command processor if exists
    // Get meta-command processing function through command processor if exists
    return this;
  }
}

module.exports = MessageHandler;
