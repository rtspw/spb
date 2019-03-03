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

  useCommandManager(commandManager) {
    this.commandManager = commandManager;
    return this;
  },
};

module.exports = BaseCommand;
