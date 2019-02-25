'use strict';

const Logger = require('./src/logger/logger');

const loggerOptions = {
  willLogToFile: true,
  UTCOffset: -480,
  formatOptions: {
    useAMPM: true,
    useFullYear: true,
    showDayOfWeek: true,
    showMilliseconds: false,
    showUTCOffset: false,
    dateSeparator: '/',
  },
};

try {
  const test = new Logger(loggerOptions);
  test.info('More test info.');
  test.warn('Option missing. Opting to use default.');
  test.error('Something failed...');
  test.kill();
  test.info('Testing output to file after killing.');
} catch (e) {
  console.log('Error:', e.message, e.stack);
}
