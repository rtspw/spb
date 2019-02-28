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
    throw new Error('Must specify whether to log to a file using a boolean.');
  }

  if (typeof logDirName !== 'string' || logDirName.length <= 0) {
    throw new Error('Log Directory Name must be a string of at least one character.');
  }

  if (typeof useANSIStyling !== 'boolean') {
    throw new Error('Must specify whether to use ANSI styling for console output using a boolean.');
  }

  if (typeof UTCOffset !== 'number') {
    throw new Error('UTC Offset must be a number (in minutes).');
  }

  if (typeof formatOptions !== 'object') {
    throw new Error('Formatting Options must be an object.');
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
    console.error('ERROR:', err.message);
    console.error('ERROR:', 'Disabling logging to file.');
    logger.willLogToFile = false;
  });

  logger.writeStream.on('finish', () => {
    console.info('INFO:', 'Logger write stream has been closed.');
  });
}

/**
 * @param {Logger} logger
 * @return {Promise} Logging file and its write stream is created
 */
async function __setupLogToFile(logger) {
  try {
    await __setupLoggingDirectory();
    logger.writeStream = fs.createWriteStream(`${__options.logDirName}/test.txt`, { flags: 'a' });
    __registerWriteStreamListeners(logger);
  } catch (error) {
    console.error('ERROR:', err.message);
    console.error('ERROR:', 'Disabling logging to file.');
    __options.willLogToFile = false;
  }
}


class Logger {
  constructor(options = {}) {
    console.info('INIT:', 'Setting up logger.');
    const validatedOptions = __validateOptions(options);
    __setPrivateOptions(validatedOptions);
    this.timestampFormatter = new TimestampFormatter(this.UTCOffset, __options.formatOptions);
    this.messageBuilder = new MessageBuilder(this.timestampFormatter);
    if (__options.willLogToFile) {
      this.settingUpLogToFile = __setupLogToFile(this);
    }
  }

  info(message) {
    const typeStyles = __options.useANSIStyling ? ['white', 'bgGreen'] : [];
    const messageStyles = __options.useANSIStyling ? ['green'] : [];
    const logConsoleMessage = this.messageBuilder.buildLogConsoleMessage({
      text: 'INFO', styles: typeStyles,
    }, {
      text: message, styles: messageStyles,
    });
    console.info(logConsoleMessage);
    if (__options.willLogToFile) {
      const logFileMessage = this.messageBuilder.buildLogFileMessage('INFO', message);
      this.settingUpLogToFile.then(() => {
        this.writeStream.write(logFileMessage);
      });
    }
  }

  warn(message) {
    const typeStyles = __options.useANSIStyling ? ['white', 'bgMagenta'] : [];
    const messageStyles = __options.useANSIStyling ? ['magenta'] : [];
    const logConsoleMessage = this.messageBuilder.buildLogConsoleMessage({
      text: 'WARN', styles: typeStyles,
    }, {
      text: message,
      styles: messageStyles,
    });
    console.warn(logConsoleMessage);
    if (__options.willLogToFile) {
      const logFileMessage = this.messageBuilder.buildLogFileMessage('WARN', message);
      this.settingUpLogToFile.then(() => {
        this.writeStream.write(logFileMessage);
      });
    }
  }

  error(message) {
    const typeStyles = __options.useANSIStyling ? ['white', 'bgRed'] : [];
    const messageStyles = __options.useANSIStyling ? ['red'] : [];
    const logConsoleMessage = this.messageBuilder.buildLogConsoleMessage({
      text: 'ERROR', styles: typeStyles,
    }, {
      text: message,
      styles: messageStyles,
    });
    console.error(logConsoleMessage);
    if (__options.willLogToFile) {
      const logFileMessage = this.messageBuilder.buildLogFileMessage('WARN', message);
      this.settingUpLogToFile.then(() => {
        this.writeStream.write(logFileMessage);
      });
    }
  }

  kill() {
    if (__options.willLogToFile) {
      this.settingUpLogToFile.then(() => {
        const finalMessage = this.messageBuilder.buildLogFileMessage('END', 'Killing logging to file process.');
        this.writeStream.end(finalMessage);
      });
      __options.willLogToFile = false;
    }
  }
}

module.exports = Logger;
