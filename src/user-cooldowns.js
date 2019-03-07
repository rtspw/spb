'use strict';

const UserCooldownError = require('./errors/user-cooldown-error');

const UserCooldowns = {

  /**
   * Returns a function that limits function calls by users
   * Cooldowns are stored in <userID:timestamp> pairs in an object saved by closure
   * @param {Function} fn to decorate with cooldowns
   * @param {number} cooldown in milliseconds
   */
  decorate(fn, cooldown = 0) {
    if (cooldown == null || cooldown <= 0) return fn;

    const cooldowns = {};
    return async function runWithUserCooldowns(message, ...args) {
      const { id: userID } = message.author;
      const cooldownInMs = cooldown * 1000;

      if (cooldowns[userID] != null) {
        const calltime = cooldowns[userID];
        const elapsedTime = Date.now() - calltime;
        const remainingTime = cooldownInMs - elapsedTime;
        throw new UserCooldownError(cooldown, remainingTime);
      }

      cooldowns[userID] = Date.now();
      setTimeout(() => {
        delete cooldowns[userID];
      }, cooldownInMs);

      try {
        await fn(message, ...args);
      } catch (err) {
        throw err;
      }
    };
  },
};

module.exports = UserCooldowns;
