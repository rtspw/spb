'use strict';

const BaseCommand = require('./base-command');

const metadata = {
  aliases: ['ping', 'pong'],
  description: 'Check response time from Discord to the bot.',
  adminOnly: false,
  usesBot: true,
  usesLogger: true,
  usesCommandMap: true,
};

const Test = Object.create(BaseCommand);

Test.run = function run(bot, message) {
  console.log('hi');
  return this;
};

module.exports = Test;
module.exports.metadata = metadata;
