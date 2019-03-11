'use strict';

const UserCooldownError = require('./errors/user-cooldown-error');
const ChannelCooldownError = require('./errors/channel-cooldown-error');

const Cooldowns = {

  /**
   * Returns a function that limits function calls
   * Cooldowns are stored in <id:timestamp> pairs in an object saved by closure
   * @param {Function} fn to decorate with cooldowns
   * @param {number} cooldown in milliseconds
   */
  decorateWithCooldowns(fn, cooldown = 0, CooldownErrorConstructor, getIDCallback) {
    if (cooldown == null || cooldown <= 0) return fn;

    const cooldowns = {};
    return async function runWithUserCooldowns(message, ...args) {
      const id = getIDCallback(message);
      const cooldownInMs = cooldown * 1000;

      if (cooldowns[id] != null) {
        const calltime = cooldowns[id];
        const elapsedTime = Date.now() - calltime;
        const remainingTime = cooldownInMs - elapsedTime;
        throw new CooldownErrorConstructor(cooldown, remainingTime);
      }

      cooldowns[id] = Date.now();
      setTimeout(() => {
        delete cooldowns[id];
      }, cooldownInMs);

      try {
        await fn(message, ...args);
      } catch (err) {
        throw err;
      }
    };
  },

  decorateWithAllCooldowns(fn, userCooldown = 0, channelCooldown = 0) {
    const fnWithUserCooldowns = this.decorateWithCooldowns(
      fn,
      userCooldown,
      UserCooldownError,
      message => message.author.id,
    );
    const fnWithChannelCooldowns = this.decorateWithCooldowns(
      fnWithUserCooldowns,
      channelCooldown,
      ChannelCooldownError,
      message => message.channel.id,
    );
    return fnWithChannelCooldowns;
  },
};

module.exports = Cooldowns;
