'use strict';

const SPBot = require('./src/spbot');

const botOptions = require('./bot-options');

try {
  const bot = new SPBot(process.env.DISCORD_SPBOT_TOKEN, botOptions);
  bot.connect();
} catch (err) {
  console.log('ERROR:', err.message);
}
