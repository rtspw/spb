'use strict';

const fs = require('fs');

const util = require('../util');
const MessageBuilder = require('./message-builder');
const TimestampFormatter = require('./timestamp-formatter');

const __options = {};

function __validateOptions(options) {
  const {
    willLogToFile = true,
    logDirName = 'log',
    useANSIStyling = true,
    UTCOffset = 0,
    formatOptions = {},
  } = options;

  if (typeof willLogToFile !== 'boolean') {
    throw new TypeError('Must specify whether to log to a file using a boolean.');
  }

  if (typeof logDirName !== 'string' || logDirName.length <= 0) {
    throw new TypeError('Log Directory Name must be a string of at least one character.');
  }

  if (typeof useANSIStyling !== 'boolean') {
    throw new TypeError('Must specify whether to use ANSI styling for console output using a boolean.');
  }

  if (typeof UTCOffset !== 'number') {
    throw new TypeError('UTC Offset must be a number (in minutes).');
  }

  if (typeof formatOptions !== 'object') {
    throw new TypeError('Formatting Options must be an object.');
  }

  return {
    willLogToFile,
    logDirName,
    useANSIStyling,
    UTCOffset,
    formatOptions,
  };
}

function __setPrivateOptions(options = {}) {
  Object.assign(__options, options);
}

async function __setupLoggingDirectory() {
  const { logDirName: dirName } = __options;
  try {
    await util.mkDirPromise(dirName);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

function __registerWriteStreamListeners(logger) {
  logger.writeStream.on('error', (err) => {
    logger.willLogToFile = false;
    logger.error(err.message);
    logger.error('Disabling logging to file.');
  });

  logger.writeStream.on('finish', () => {
    logger.info('Logger write stream has been closed.');
  });
}

/**
 * @param {Logger} logger
 * @return {Promise} Logging file and its write stream is created
 */
async function __setupLogToFile(logger) {
  if (!__options.willLogToFile) throw new Error();
  try {
    await __setupLoggingDirectory();
    const appendFlag = 'a';
    const logFileName = `${__options.logDirName}/test.txt`;
    logger.writeStream = fs.createWriteStream(logFileName, { flags: appendFlag });
    __registerWriteStreamListeners(logger);
  } catch (error) {
    __options.willLogToFile = false;
    logger.error(error.message);
    logger.error('Disabling logging to file.');
  }
}

function __logMessageToFile(logger, timestamp = '', type = '', message = '') {
  if (!__options.willLogToFile) return;
  const logFileMessage = MessageBuilder.buildLogFileMessage(timestamp, type, message);
  logger.settingUpLogToFile.then(() => {
    logger.writeStream.write(logFileMessage);
  });
}

function __setupANSIStylingOptions() {
  if (!__options.useANSIStyling) {
    MessageBuilder.disableStyling();
  }
}

class Logger {
  constructor(options = {}) {
    const validatedOptions = __validateOptions(options);
    __setPrivateOptions(validatedOptions);
    __setupANSIStylingOptions();
    this.timestampFormatter = new TimestampFormatter(__options.UTCOffset, __options.formatOptions);
    this.settingUpLogToFile = __setupLogToFile(this).catch(() => {
      this.info('Logging to file disabled for this session.');
    });
    this.info('New logger instance ready.');
  }

  info(message = '') {
    const typeStyles = ['white', 'bgGreen'];
    const messageStyles = [];
    const timestampStyles = ['grey'];
    const timestamp = this.timestampFormatter.getTimestampWithOffset();
    const logConsoleMessage = MessageBuilder.buildLogConsoleMessage(
      { text: timestamp, styles: timestampStyles },
      { text: 'INFO', styles: typeStyles },
      { text: message, styles: messageStyles },
    );
    __logMessageToFile(this, timestamp, 'INFO', message);
    console.info(logConsoleMessage);
  }

  warn(message = '') {
    const typeStyles = ['white', 'bgMagenta'];
    const messageStyles = [];
    const timestampStyles = ['grey'];
    const timestamp = this.timestampFormatter.getTimestampWithOffset();
    const logConsoleMessage = MessageBuilder.buildLogConsoleMessage(
      { text: timestamp, styles: timestampStyles },
      { text: 'WARN', styles: typeStyles },
      { text: message, styles: messageStyles },
    );
    __logMessageToFile(this, timestamp, 'WARN', message);
    console.warn(logConsoleMessage);
  }

  error(message = '') {
    const typeStyles = ['white', 'bgRed'];
    const messageStyles = [];
    const timestampStyles = ['grey'];
    const timestamp = this.timestampFormatter.getTimestampWithOffset();
    const logConsoleMessage = MessageBuilder.buildLogConsoleMessage(
      { text: timestamp, styles: timestampStyles },
      { text: 'ERROR', styles: typeStyles },
      { text: message, styles: messageStyles },
    );
    __logMessageToFile(this, timestamp, 'ERROR', message);
    console.error(logConsoleMessage);
  }

  kill() {
    if (__options.willLogToFile) {
      this.settingUpLogToFile.then(() => {
        const timestamp = this.timestampFormatter.getTimestampWithOffset();
        const finalMessage = MessageBuilder.buildLogFileMessage(timestamp, 'INFO', 'Killing logging to file process.');
        this.writeStream.end(finalMessage);
      });
      __options.willLogToFile = false;
    }
  }
}

module.exports = Logger;
