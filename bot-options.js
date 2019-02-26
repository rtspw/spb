'use strict';

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

module.exports = { loggerOptions };
