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

function __getStyledMessage(type = 'INFO') {
  if (typeof type === 'string') {
    return type.trim().padEnd(5);
  }
  const {
    text = 'INFO',
    styles = [],
  } = type;
  const sanitizedText = text.trim().padEnd(5);
  const styledMessage = __applyStylesToMessage(sanitizedText, styles);
  return styledMessage;
}


class MessageBuilder {
  constructor(timestampFormatter) {
    this.timestampFormatter = timestampFormatter;
  }

  buildLogConsoleMessage(type = 'INFO', message = '') {
    const styledMessageType = __getStyledMessage(type);
    const styledMessage = __getStyledMessage(message);
    const timestamp = this.timestampFormatter.getTimestampWithOffset();
    const logMessage = `${timestamp} ${styledMessageType} | ${styledMessage}`;
    return logMessage;
  }

  buildLogFileMessage(type = 'INFO', message = '') {
    const timestamp = this.timestampFormatter.getTimestampWithOffset();
    const msgType = type.toUpperCase().trim().padEnd(5);
    const logMessage = `${timestamp} ${msgType} | ${message}\n`;
    return logMessage;
  }
}

module.exports = MessageBuilder;
