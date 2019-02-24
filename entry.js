'use strict';

const Logger = require('./src/logger');

try {
  const tasdf = new Logger({
    UTCOffset: -480,
    formatOptions: {
      useAMPM: true,
      useFullYear: true,
      showDayOfWeek: false,
      showMilliseconds: false,
      showUTCOffset: true,
      dateSeparator: '/',
    },
  });
} catch(e) {
  console.log('Error:', e.message);
}
