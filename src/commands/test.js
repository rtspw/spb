'use strict';

const metadata = {
  id: 'ping',
  aliases: ['ping', 'pong'],
  description: 'Check response time from Discord to the bot.',
};

const Test = {
  run(bot, message) {
    console.log('hi');
    return this;
  },
};

module.exports = Test;
module.exports.metadata = metadata;
