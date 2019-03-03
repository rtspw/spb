'use strict';

const BaseCommand = require('./base-command');

const metadata = {
  aliases: ['ping', 'pong'],
  description: 'Check response time from Discord to the bot.',
  adminOnly: true,
};

const Ping = Object.create(BaseCommand);

Ping.run = async function run(message) {
  const {
    timestamp: msgTimestamp,
    channel: msgChannel,
  } = message;
  const sentMessage = await msgChannel.createMessage('Measuring latency...');
  const sentMsgTimestamp = sentMessage.timestamp;
  const latency = Math.round(sentMsgTimestamp - msgTimestamp);
  sentMessage.edit(`**Latency**: ${latency}ms.`);
};

module.exports = Ping;
module.exports.metadata = metadata;
