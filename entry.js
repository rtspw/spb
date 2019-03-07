'use strict';

const SPBot = require('./src/spbot');
const botOptions = require('./bot-options');

require('dotenv').config();

const bot = new SPBot(process.env.DISCORD_SPBOT_TOKEN, botOptions);
bot.connect().catch(() => {
  process.exit();
});
