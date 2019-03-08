'use strict';

const CooldownError = require('./cooldown-error');

class ChannelCooldownError extends CooldownError {
  constructor(totalCooldown = 0, timeLeft = 0, ...args) {
    super(totalCooldown, timeLeft, ...args);
    this.name = 'ChannelCooldownError';
  }
}

module.exports = ChannelCooldownError;
