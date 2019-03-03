'use strict';

const BaseCommand = require('./base-command');

const metadata = {
  aliases: ['reload'],
  description: 'Check response time from Discord to the bot.',
  adminOnly: false,
  usesCommandManager: true,
};

const Test2 = Object.create(BaseCommand);

Test2.run = async function run(message) {
  const { channel } = message;
  try {
    await this.commandManager.reloadCommands();
    channel.createMessage('Reload successful.');
  } catch (err) {
    channel.createMessage('Failed to reload commands.');
  }
};

module.exports = Test2;
module.exports.metadata = metadata;
