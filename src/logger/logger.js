'use strict';

const fs = require('fs');

const util = require('../util');
const MessageBuilder = require('./message-builder');
const TimestampFormatter = require('./timestamp-formatter');

function __sanitizeOptions(options) {
  const {
    willLogToFile = true,
    logDirName = 'log',
    UTCOffset = 0,
    formatOptions = {},
  } = options;

  if (typeof willLogToFile !== 'boolean') {
    throw new Error('Must specify whether to log to a file using a boolean');
  }

  if (typeof logDirName !== 'string' || logDirName.length <= 0) {
    throw new Error('Log Directory Name must be a string of at least one character');
  }

  if (typeof UTCOffset !== 'number') {
    throw new Error('UTC Offset must be a number (in minutes)');
  }

  if (typeof formatOptions !== 'object') {
    throw new Error('Formatting Options must be an object');
  }

  return {
    willLogToFile,
    logDirName,
    UTCOffset,
    formatOptions,
  };
}


function __attachLoggerToDirectory(logger) {
  return new Promise((fulfill, reject) => {
    const { logDirName: dirName } = logger;
    util.mkDirPromise(dirName)
      .then(() => {
        console.info('INIT:', `Created new '${dirName}' directory for logging output.`);
        fulfill();
      }).catch((err) => {
        if (err.code === 'EEXIST') {
          console.info('INIT:', `Using directory '${dirName}' for logging output.`);
          fulfill();
        } else {
          reject(err);
        }
      });
  });
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


function __setupLogToFile(logger) {
  return new Promise((fulfill, reject) => {
    __attachLoggerToDirectory(logger).then(() => {
      logger.writeStream = fs.createWriteStream(`${logger.logDirName}/test.txt`, { flags: 'a' });
      __registerWriteStreamListeners(logger);
      fulfill();
    }).catch((err) => {
      console.error('ERROR:', err.message);
      console.error('ERROR:', 'Disabling logging to file.');
      logger.willLogToFile = false;
      reject();
    });
  });
}

class Logger {
  constructor(options = {}) {
    const sanitizedOptions = __sanitizeOptions(options);
    Object.assign(this, sanitizedOptions);
    this.timestampFormatter = new TimestampFormatter(this.UTCOffset, this.formatOptions);
    this.messageBuilder = new MessageBuilder(this.timestampFormatter);
    if (this.willLogToFile) {
      this.settingUpLogToFile = __setupLogToFile(this);
    }
  }

  info(message) {
    const logConsoleMessage = this.messageBuilder.buildLogConsoleMessage({
      text: 'INFO', styles: ['white', 'bgGreen'],
    }, {
      text: message,
      styles: ['green'],
    });
    console.info(logConsoleMessage);
    if (this.willLogToFile) {
      const logFileMessage = this.messageBuilder.buildLogFileMessage('INFO', message);
      this.settingUpLogToFile.then(() => {
        this.writeStream.write(logFileMessage);
      });
    }
  }

  warn(message) {
    const logConsoleMessage = this.messageBuilder.buildLogConsoleMessage({
      text: 'WARN', styles: ['white', 'bgMagenta'],
    }, {
      text: message,
      styles: ['magenta'],
    });
    console.warn(logConsoleMessage);
    if (this.willLogToFile) {
      const logFileMessage = this.messageBuilder.buildLogFileMessage('WARN', message);
      this.settingUpLogToFile.then(() => {
        this.writeStream.write(logFileMessage);
      });
    }
  }

  error(message) {
    const logConsoleMessage = this.messageBuilder.buildLogConsoleMessage({
      text: 'ERROR', styles: ['white', 'bgRed'],
    }, {
      text: message,
      styles: ['red'],
    });
    console.error(logConsoleMessage);
    if (this.willLogToFile) {
      const logFileMessage = this.messageBuilder.buildLogFileMessage('WARN', message);
      this.settingUpLogToFile.then(() => {
        this.writeStream.write(logFileMessage);
      });
    }
  }

  kill() {
    if (this.willLogToFile) {
      this.settingUpLogToFile.then(() => {
        const finalMessage = this.messageBuilder.buildLogFileMessage('END', 'Killing logging to file process.');
        this.writeStream.end(finalMessage);
      });
      this.willLogToFile = false;
    }
  }
}

module.exports = Logger;
