'use strict';

const UserCooldownError = require('./errors/user-cooldown-error');
const ChannelCooldownError = require('./errors/channel-cooldown-error');

const Cooldowns = {

  /**
   * Returns a function that limits function calls by users
   * Cooldowns are stored in <userID:timestamp> pairs in an object saved by closure
   * @param {Function} fn to decorate with cooldowns
   * @param {number} cooldown in milliseconds
   */
  decorateWithUserCooldowns(fn, cooldown = 0) {
    if (cooldown == null || cooldown <= 0) return fn;

    const userCooldowns = {};
    return async function runWithUserCooldowns(message, ...args) {
      const { id: userID } = message.author;
      const cooldownInMs = cooldown * 1000;

      if (userCooldowns[userID] != null) {
        const calltime = userCooldowns[userID];
        const elapsedTime = Date.now() - calltime;
        const remainingTime = cooldownInMs - elapsedTime;
        throw new UserCooldownError(cooldown, remainingTime);
      }

      userCooldowns[userID] = Date.now();
      setTimeout(() => {
        delete userCooldowns[userID];
      }, cooldownInMs);

      try {
        await fn(message, ...args);
      } catch (err) {
        throw err;
      }
    };
  },

  decorateWithChannelCooldowns(fn, cooldown = 0) {
    if (cooldown == null || cooldown <= 0) return fn;

    const channelCooldowns = {};
    return async function runWithChannelCooldowns(message, ...args) {
      const { id: userID } = message.author;
      const cooldownInMs = cooldown * 1000;

      if (channelCooldowns[userID] != null) {
        const calltime = channelCooldowns[userID];
        const elapsedTime = Date.now() - calltime;
        const remainingTime = cooldownInMs - elapsedTime;
        throw new ChannelCooldownError(cooldown, remainingTime);
      }

      channelCooldowns[userID] = Date.now();
      setTimeout(() => {
        delete channelCooldowns[userID];
      }, cooldownInMs);

      try {
        await fn(message, ...args);
      } catch (err) {
        throw err;
      }
    };
  },

  decorateWithAllCooldowns(fn, userCooldown = 0, channelCooldown = 0) {
    const fnWithUserCooldowns = this.decorateWithUserCooldowns(fn, userCooldown);
    const fnWithChannelCooldowns = this.decorateWithChannelCooldowns(fnWithUserCooldowns, channelCooldown);
    return fnWithChannelCooldowns;
  },
};

module.exports = Cooldowns;
