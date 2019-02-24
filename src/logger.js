'use strict';

const fs = require('fs');

const util = require('./util');
const LoggerFormatter = require('./logger-formatter');

function __sanitizeOptions(options) {
  const {
    willLogToFile = true,
    logDirName = 'log',
    UTCOffset = 0,
    formatOptions = {},
  } = options;

  return {
    willLogToFile,
    logDirName,
    UTCOffset,
    formatOptions,
  };
}


function __attachLoggerToDirectory(logger) {
  const { logDirName: dirName } = logger;
  util.mkDirPromise(dirName)
    .then(() => {
      console.info('INIT:', `Created new '${dirName}' directory for logging output.`);
    }).catch((e) => {
      if (e.message.includes('EEXIST')) {
        console.info('INIT:', `Using directory '${dirName}' for logging output.`);
      } else {
        console.info('ERROR', e.message);
      }
    }).then(() => {
      logger.isAttachedToDir = true;
    });
}

class Logger {
  constructor(options = {}) {
    const sanitizedOptions = __sanitizeOptions(options);
    Object.assign(this, sanitizedOptions);
    this.formatter = new LoggerFormatter(this.formatOptions);
    this.isAttachedToDir = false;
    if (this.willLogToFile) {
      __attachLoggerToDirectory(this);
      const writeStream = fs.createWriteStream(`${this.logDirName}/test.txt`, { flags: 'a' });
      writeStream.write(`${this.formatter.getFormattedDateWithOffset(this.UTCOffset)}\n`);
      writeStream.end();
    }
  }
}

module.exports = Logger;
