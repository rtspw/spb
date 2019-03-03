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
    console.info('INIT:', `Created new '${dirName}' directory for logging output.`);
    return Promise.resolve();
  } catch (err) {
    if (err.code === 'EEXIST') {
      console.info('INIT:', `Using directory '${dirName}' for logging output.`);
      return err;
    }
    throw err;
  }
}

function __registerWriteStreamListeners(logger) {
  logger.writeStream.on('error', (err) => {
    logger.willLogToFile = false;
    logger.error('ERROR:', err.message);
    logger.error('ERROR:', 'Disabling logging to file.');
  });

  logger.writeStream.on('finish', () => {
    logger.info('INFO:', 'Logger write stream has been closed.');
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
    const logFileName = `${__options.dirName}/test.txt`;
    logger.writeStream = fs.createWriteStream(logFileName, { flags: appendFlag });
    __registerWriteStreamListeners(logger);
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('ERROR:', 'Disabling logging to file.');
    __options.willLogToFile = false;
  }
}

function __logMessageToFile(logger, type = '', message = '') {
  if (!__options.willLogToFile) return;
  const logFileMessage = logger.messageBuilder.buildLogFileMessage(type, message);
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
    this.timestampFormatter = new TimestampFormatter(this.UTCOffset, __options.formatOptions);
    this.settingUpLogToFile = __setupLogToFile(this).catch(() => {
      this.info('Logging to file disabled for this session.');
    });
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
    console.info(logConsoleMessage);
    __logMessageToFile(this, 'INFO', message);
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
    console.warn(logConsoleMessage);
    __logMessageToFile(this, 'WARN', message);
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
    console.error(logConsoleMessage);
    if (__options.willLogToFile) {
      __logMessageToFile(this, 'ERROR', message);
    }
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
