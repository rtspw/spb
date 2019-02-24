'use strict';

const Logger = require('./src/logger');

const loggerOptions = {
  willLogToFile: true,
  UTCOffset: -480,
  formatOptions: {
    useAMPM: true,
    useFullYear: true,
    showDayOfWeek: false,
    showMilliseconds: false,
    showUTCOffset: false,
    dateSeparator: '/',
  },
};

try {
  const test = new Logger(loggerOptions);
} catch(e) {
  console.log('Error:', e.message);
}
