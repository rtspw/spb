'use strict';

const UserCooldownError = require('./errors/user-cooldown-error');
const ChannelCooldownError = require('./errors/channel-cooldown-error');
const GuildCooldownError = require('./errors/guild-cooldown-error');


class Cooldowns {
  constructor(adminIDs = [], adminsExceptFromCooldown = true) {
    this.adminIDs = adminIDs;
    this.adminsExceptFromCooldown = adminsExceptFromCooldown;
  }

  /**
   * Returns a function that limits function calls
   * Cooldowns are stored in <id:timestamp> pairs in an object saved by closure
   * @param {Function} fn to decorate with cooldowns
   * @param {number} cooldown in milliseconds
   */
  decorateWithCooldowns(fn, cooldown = 0, CooldownErrorConstructor, getIDCallback) {
    if (cooldown == null || cooldown <= 0) return fn;

    const exemptIDs = this.adminsExceptFromCooldown ? this.adminIDs : [];
    const cooldowns = {};

    return async function runWithCooldowns(message, ...args) {
      if (!exemptIDs.includes(message.author.id)) {
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
      }

      try {
        await fn(message, ...args);
      } catch (err) {
        throw err;
      }
    };
  }

  /**
   * Returns a function decorated with all existing cooldowns
   * @param {Function} fn
   * @param {Object} cooldowns
   */
  decorateWithAllCooldowns(fn, cooldowns = {}) {
    const fnWithUserCooldowns = this.decorateWithCooldowns(
      fn,
      cooldowns.userCooldown,
      UserCooldownError,
      message => message.author.id,
    );
    const fnWithChannelCooldowns = this.decorateWithCooldowns(
      fnWithUserCooldowns,
      cooldowns.channelCooldown,
      ChannelCooldownError,
      message => message.channel.id,
    );
    const fnWithGuildCooldowns = this.decorateWithCooldowns(
      fnWithChannelCooldowns,
      cooldowns.guildCooldown,
      GuildCooldownError,
      message => message.channel.guild.id,
    );
    return fnWithGuildCooldowns;
  }
}

module.exports = Cooldowns;
