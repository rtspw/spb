'use strict';

module.exports.metadata = {
  aliases: ['shutdown'],
  description: 'Disconnects the bot from Discord and shuts down the process.',
  adminOnly: true,
  usesBot: true,
  usesLogger: true,
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
    this.logger.info('Shutting down bot...');
    await this.logger.kill();
    await this.bot.disconnect();
    process.exit();
  } catch (err) {
    channel.createMessage('Failed to shutdown bot.');
    throw err;
  }
};
