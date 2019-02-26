'use strict';

const Eris = require('eris');
const Logger = require('./logger/logger');
const MessageHandler = require('./message-handler');

function __validateOptions(options) {
  const {
    loggerOptions = {},
  } = options;

  if (typeof loggerOptions !== 'object') {
    throw new Error('Logger Options must be an object.');
  }

  return {
    loggerOptions,
  };
}

function __registerEventListeners(spbot) {
  spbot.eris.on('ready', () => {
    console.info('INIT:', 'Successful connection to Discord API.');
    spbot.logger.info('Bot is setup and ready to use.');
  });

  spbot.eris.on('messageCreate', (message) => {
    spbot.messageHandler.handle(message);
  });

  spbot.eris.on('unknown', (packet, shardID) => {
    spbot.logger.warn(`Shard ${shardID} encountered an unknown packet.`);
  });

  spbot.eris.on('warn', (message, shardID) => {
    spbot.logger.warn(`${message} for shard ${shardID}`);
  });

  spbot.eris.on('error', (error, shardID) => {
    spbot.logger.error(`${error.message} for shard ${shardID}`);
  });

  spbot.eris.on('connect', (shardID) => {
    spbot.logger.info(`Shard ${shardID} successfully connected.`);
  });
}


class SPBot {
  constructor(options) {
    try {
      const validatedOptions = __validateOptions(options);
      Object.assign(this, validatedOptions);
      this.eris = new Eris(process.env.DISCORD_SPBOT_TOKEN);
      this.messageHandler = new MessageHandler(this.eris);
      this.logger = new Logger(this.loggerOptions);
    } catch (err) {
      console.error('Error:', 'Failed to initialize SPBot instance.');
      throw err;
    }
  }

  connect() {
    console.info('INIT:', 'Attempting to connect to Discord API.');
    __registerEventListeners(this);
    this.eris.connect();
  }
}


module.exports = SPBot;
