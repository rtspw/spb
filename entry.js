'use strict';

const SPBot = require('./src/spbot');

const botOptions = require('./bot-options');

try {
  const bot = new SPBot(botOptions);
  bot.connect();
} catch (e) {
  console.log(e.stack);
}
