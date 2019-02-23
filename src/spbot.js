'use strict';

const Eris = require('eris');

function __registerEventListeners(spbot) {
  spbot.eris.on('ready', () => {

  });

  spbot.eris.on('messageCreate', (message) => {

  });

  spbot.eris.on('error', (error) => {

  });
}


class SPBot {
  constructor(options) {
    this.eris = new Eris(process.env.DISCORD_SPBOT_TOKEN);
  }

  connect() {
    __registerEventListeners(this);
    this.eris.connect();
  }
}


module.exports = SPBot;
