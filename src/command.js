'use strict';

const PermissionError = require('./errors/permission-error');
const UserCooldownError = require('./errors/user-cooldown-error');
const ChannelCooldownError = require('./errors/channel-cooldown-error');
const GuildCooldownError = require('./errors/guild-cooldown-error');
const Cooldowns = require('./cooldowns');

function __validateMetadata(metadata) {
  const {
    aliases,
    description = '',
    adminOnly = false,
    userCooldown = 0,
    channelCooldown = 0,
    guildCooldown = 0,
    usesBot = false,
    usesLogger = false,
    usesCommandManager = false,
  } = metadata;

  if (!(aliases instanceof Array) || aliases.length < 1) {
    throw new TypeError('Command aliases must be an array with at least one entry.');
  }

  aliases.forEach((alias) => {
    if (typeof alias !== 'string') {
      throw new TypeError('Command aliases must all be strings.');
    }
  });

  if (typeof description !== 'string') {
    throw new TypeError('Command description must be a string.');
  }
  if (typeof adminOnly !== 'boolean') {
    throw new TypeError('Must specify adminOnly using a boolean.');
  }
  if (typeof userCooldown !== 'number') {
    throw new TypeError('User Cooldown must be a number (in seconds).');
  }
  if (typeof channelCooldown !== 'number') {
    throw new TypeError('Channel Cooldown must be a number (in seconds).');
  }
  if (typeof guildCooldown !== 'number') {
    throw new TypeError('Guild Cooldown must be a number (in seconds).');
  }
  if (typeof usesBot !== 'boolean') {
    throw new TypeError('Must specify usesBot using a boolean.');
  }
  if (typeof usesLogger !== 'boolean') {
    throw new TypeError('Must specify usesLogger using a boolean.');
  }
  if (typeof usesCommandManager !== 'boolean') {
    throw new TypeError('Must specify usesCommandManager using a boolean.');
  }

  return {
    aliases,
    description,
    adminOnly,
    userCooldown,
    channelCooldown,
    guildCooldown,
    usesBot,
    usesLogger,
    usesCommandManager,
  };
}

function __validateOptions(options = {}) {
  if (!(options instanceof Object)) {
    throw new TypeError('Options must be an object.');
  }

  const {
    adminIDs = [],
  } = options;

  if (!(adminIDs instanceof Array)) {
    throw new TypeError('Admin IDs must be an array.');
  }

  adminIDs.forEach((id) => {
    if (typeof id !== 'string') {
      throw new TypeError('Admin IDs must be an array of strings.');
    }
  });

  return {
    adminIDs,
  };
}

function __validateHooks(hooks = {}) {
  if (!(hooks instanceof Object)) {
    throw new TypeError('Hooks object must be an object.');
  }

  Object.entries(hooks).forEach(([name, hook]) => {
    if (hook != null && typeof hook !== 'function') {
      throw new TypeError(`Hook '${name}' must be a function.`);
    }
  });

  return hooks;
}

function __throwIfLackingUserPermissions(command, message) {
  const { adminOnly } = command.metadata;
  if (adminOnly) {
    const { id: userID } = message.author;
    const { adminIDs } = command.options;
    if (!adminIDs.includes(userID)) {
      throw new PermissionError('User is not an admin.');
    }
  }
}

function __handleCooldownError(message, error, specificCallback, genericCallback) {
  if (specificCallback != null) {
    const { totalCooldown, timeLeft } = error;
    specificCallback(message, { totalCooldown, timeLeft });
  } else if (genericCallback != null) {
    const { totalCooldown, timeLeft } = error;
    genericCallback(message, { totalCooldown, timeLeft });
  }
}

function __handleErrorsWithHooks(command, message, err) {
  if (err instanceof PermissionError) {
    const { onPermissionError } = command.hooks;
    if (onPermissionError != null) {
      onPermissionError(message);
    }
  } else if (err instanceof UserCooldownError) {
    const { onUserCooldownError, onAnyCooldownError } = command.hooks;
    __handleCooldownError(message, err, onUserCooldownError, onAnyCooldownError);
  } else if (err instanceof ChannelCooldownError) {
    const { onChannelCooldownError, onAnyCooldownError } = command.hooks;
    __handleCooldownError(message, err, onChannelCooldownError, onAnyCooldownError);
  } else if (err instanceof GuildCooldownError) {
    const { onGuildCooldownError, onAnyCooldownError } = command.hooks;
    __handleCooldownError(message, err, onGuildCooldownError, onAnyCooldownError);
  } else {
    throw err;
  }
}


class Command {
  constructor(runFunction, metadata, hooks, options) {
    this.metadata = __validateMetadata(metadata);
    this.hooks = __validateHooks(hooks);
    this.options = __validateOptions(options);
    const { userCooldown, channelCooldown, guildCooldown } = this.metadata;
    this.runFunction = Cooldowns.decorateWithAllCooldowns(
      runFunction,
      { userCooldown, channelCooldown, guildCooldown },
    );
  }

  async runCommand(message) {
    try {
      __throwIfLackingUserPermissions(this, message);
      await this.runFunction(message);
    } catch (err) {
      __handleErrorsWithHooks(this, message, err);
    }
  }

  useBot(bot) {
    this.bot = bot;
    return this;
  }

  useLogger(logger) {
    this.logger = logger;
    return this;
  }

  useCommandManager(commandManager) {
    this.commandManager = commandManager;
    return this;
  }
}

module.exports = Command;
