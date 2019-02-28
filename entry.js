'use strict';

const SPBot = require('./src/spbot');

const botOptions = require('./bot-options');

try {
  console.log(process.env);
  const bot = new SPBot(process.env.DISCORD_SPBOT_TOKEN, botOptions);
  bot.connect();
} catch (e) {
  console.log(e.stack);
}
