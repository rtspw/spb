'use strict';

class CooldownError extends Error {
  constructor(totalCooldown = 0, timeLeft = 0, ...args) {
    super(...args);
    this.totalCooldown = totalCooldown;
    this.timeLeft = timeLeft;
  }
}

module.exports = CooldownError;
