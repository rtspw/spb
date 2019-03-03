'use strict';

const Ansi = require('ansi-colors');


function __applyStylesToMessage(message = '', styles = []) {
  let styledMessage = message;
  styles.forEach((style) => {
    const applyColor = Ansi[style] || (str => str);
    styledMessage = applyColor(styledMessage);
  });
  return styledMessage;
}

function __getStyledMessage(message = 'INFO') {
  const minLength = 5;
  if (typeof message === 'string') {
    return message.trim().padEnd(minLength);
  }

  const {
    text = 'INFO',
    styles = [],
  } = message;
  const minLengthWithANSI = 25;
  const styledMessage = __applyStylesToMessage(text, styles);
  const sanitizedStyledMessage = styledMessage.trim().padEnd(minLengthWithANSI);
  return sanitizedStyledMessage;
}


const MessageBuilder = {
  disableStyling() {
    Ansi.enabled = false;
  },

  buildLogConsoleMessage(timestamp = '', type = 'INFO', message = '') {
    const styledTimestamp = __getStyledMessage(timestamp);
    const styledMessageType = __getStyledMessage(type);
    const styledMessage = __getStyledMessage(message);
    const logMessage = `${styledTimestamp} ${styledMessageType} | ${styledMessage}`;
    return logMessage;
  },

  buildLogFileMessage(timestamp = '', type = 'INFO', message = '') {
    const msgType = type.toUpperCase().trim().padEnd(5);
    const logMessage = `${timestamp} ${msgType} | ${message}\n`;
    return logMessage;
  },
};

module.exports = MessageBuilder;
