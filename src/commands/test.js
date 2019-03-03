'use strict';

const BaseCommand = require('./base-command');

const metadata = {
  aliases: ['ping', 'pong'],
  description: 'Check response time from Discord to the bot.',
  adminOnly: false,
  usesBot: false,
};

const Test = Object.create(BaseCommand);

Test.run = function run(message) {
  console.log(this.commandMap);
  return this;
};

module.exports = Test;
module.exports.metadata = metadata;
