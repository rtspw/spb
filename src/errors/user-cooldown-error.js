'use strict';

class UserCooldownError extends Error {
  constructor(totalCooldown = 0, timeLeft = 0, ...args) {
    super(...args);
    this.name = 'UserCooldownError';
    this.totalCooldown = totalCooldown;
    this.timeLeft = timeLeft;
  }
}

module.exports = UserCooldownError;
