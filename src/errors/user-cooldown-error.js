'use strict';

const CooldownError = require('./cooldown-error');

class UserCooldownError extends CooldownError {
  constructor(totalCooldown = 0, timeLeft = 0, ...args) {
    super(totalCooldown, timeLeft, ...args);
    this.name = 'UserCooldownError';
  }
}

module.exports = UserCooldownError;
