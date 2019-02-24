'use strict';

const LoggerFormatter = require('./logger-formatter');

function __sanitizeOptions(options) {
  const {
    UTCOffset = 0,
    formatOptions = {},
  } = options;

  return {
    UTCOffset,
    formatOptions,
  };
}

class Logger {
  constructor(options) {
    const sanitizedOptions = __sanitizeOptions(options);
    Object.assign(this, sanitizedOptions);
    this.formatter = new LoggerFormatter(this.formatOptions);
    console.log(this.formatter.getFormattedDateWithOffset(this.UTCOffset));
  }
}

module.exports = Logger;
