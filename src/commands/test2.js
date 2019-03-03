'use strict';

const BaseCommand = require('./base-command');

const metadata = {
  aliases: ['peng'],
  description: 'Check response time from Discord to the bot.',
  adminOnly: false,
};

const Test2 = Object.create(BaseCommand);

Test2.run = function run(message) {
  return this;
};

module.exports = Test2;
module.exports.metadata = metadata;
