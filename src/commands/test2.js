'use strict';

const metadata = {
  aliases: ['pong'],
  description: 'Check response time from Discord to the bot.',
  adminOnly: false,
};

const Test2 = {
  run(bot, message) {
    console.log('hi');
    return this;
  },
};

module.exports = Test2;
module.exports.metadata = metadata;
