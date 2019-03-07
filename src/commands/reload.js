'use strict';

module.exports.metadata = {
  aliases: ['reload'],
  description: 'Check response time from Discord to the bot.',
  adminOnly: false,
  usesCommandManager: true,
};

module.exports.hooks = {
  onPermissionError(message) {
    const { channel } = message;
    channel.createMessage('You do not have sufficient permissions to run this command.');
  },
};

module.exports.run = async function run(message) {
  const { channel } = message;
  try {
    await this.commandManager.reloadCommands();
    channel.createMessage('Reload successful.');
  } catch (err) {
    channel.createMessage('Failed to reload commands.');
    throw err;
  }
};
