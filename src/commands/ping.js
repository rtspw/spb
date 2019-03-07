'use strict';

module.exports.metadata = {
  aliases: ['ping', 'pong'],
  description: 'Check response time from Discord to the bot.',
  adminOnly: false,
};

module.exports.hooks = {
  onPermissionError(message) {
    const { channel } = message;
    channel.createMessage('You do not have sufficient permissions to run this command.');
  },
};

module.exports.run = async function run(message) {
  const {
    timestamp: msgTimestamp,
    channel: msgChannel,
  } = message;
  const sentMessage = await msgChannel.createMessage('Measuring latency...');
  const sentMsgTimestamp = sentMessage.timestamp;
  const latency = Math.round(sentMsgTimestamp - msgTimestamp);
  sentMessage.edit(`**Latency**: ${latency}ms.`);
};
