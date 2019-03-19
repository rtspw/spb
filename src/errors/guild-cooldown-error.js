'use strict';

const CooldownError = require('./cooldown-error');

class GuildCooldownError extends CooldownError {
  constructor(totalCooldown = 0, timeLeft = 0, ...args) {
    super(totalCooldown, timeLeft, ...args);
    this.name = 'GuildCooldownError';
  }
}

module.exports = GuildCooldownError;
