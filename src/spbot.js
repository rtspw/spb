'use strict';

const Eris = require('eris');
const Logger = require('./logger/logger');
const MessageHandler = require('./message-handler');

function __validateOptions(options) {
  const {
    loggerOptions = {},
    commandOptions = {},
  } = options;

  if (typeof loggerOptions !== 'object') {
    throw new TypeError('Logger Options must be an object.');
  }

  if (typeof commandOptions !== 'object') {
    throw new TypeError('Command Options must be an object.');
  }

  return {
    loggerOptions,
    commandOptions,
  };
}

function __registerEventListeners(spbot) {
  spbot.eris.on('ready', () => {
    spbot.logger.info('Bot is setup and ready to use.');
  });

  spbot.eris.on('messageCreate', (message) => {
    spbot.messageHandler.handle(message);
  });

  spbot.eris.on('messageDelete', (message) => {
    spbot.logger.error('A message was deleted!');
  });

  spbot.eris.on('unknown', (packet, shardID) => {
    spbot.logger.warn(`Shard ${shardID} encountered an unknown packet.`);
  });

  spbot.eris.on('warn', (message, shardID) => {
    spbot.logger.warn(`${message} (shard ${shardID})`);
  });

  spbot.eris.on('error', (error, shardID) => {
    spbot.logger.error(`${error.message} (shard ${shardID})`);
  });

  spbot.eris.on('connect', (shardID) => {
    spbot.logger.info(`Shard ${shardID} successfully connected.`);
  });
}

function __timeoutIfFailedToConnect(bot, logger, ms = 10000) {
  setTimeout(() => {
    if (!bot.ready) {
      logger.error('Bot connection timed out. Ending session.');
    }
  }, ms);
}


class SPBot {
  constructor(botToken, options) {
    try {
      const validatedOptions = __validateOptions(options);
      Object.assign(this, validatedOptions);
      this.eris = new Eris(botToken);
      this.logger = new Logger(this.loggerOptions);
      this.messageHandler = new MessageHandler(this.eris, this.logger, this.commandOptions);
    } catch (err) {
      console.error('ERROR:', 'Failed to initialize SPBot instance.');
      throw err;
    }
  }

  connect() {
    this.logger.info('Attempting to connect to Discord API.');
    __registerEventListeners(this);
    this.eris.connect();
    __timeoutIfFailedToConnect(this.eris, this.logger);
  }
}


module.exports = SPBot;
