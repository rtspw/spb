'use strict';

const BaseCommand = {
  useBot(bot) {
    this.bot = bot;
    return this;
  },

  useLogger(logger) {
    this.logger = logger;
    return this;
  },

  useCommandMap(commandMap) {
    this.commandMap = commandMap;
    return this;
  },
};

module.exports = BaseCommand;
