'use strict';

module.exports.metadata = {
  aliases: ['ping', 'pong'],
  description: 'Check response time from Discord to the bot.',
  adminOnly: false,
  userCooldown: 100,
};

module.exports.hooks = {
  onUserCooldownError(message, info) {
    const { channel } = message;
    const { timeLeft } = info;
    const timeLeftInSeconds = Math.round(timeLeft / 1000);
    channel.createMessage(`Too fast! There is still ${timeLeftInSeconds} seconds of cooldown left.`);
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
