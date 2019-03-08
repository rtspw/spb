'use strict';

const loggerOptions = {
  willLogToFile: true,
  logDirName: 'log',
  UTCOffset: -480,
  useANSIStyling: true,
  formatOptions: {
    useAMPM: true,
    useFullYear: true,
    showDayOfWeek: true,
    showMilliseconds: false,
    showUTCOffset: false,
    dateSeparator: '/',
  },
};

const commandOptions = {
  defaultPrefix: 's.',
  adminIDs: ['128369934857273344'],
  commandDirectory: 'commands',
};

module.exports = {
  commandOptions,
  loggerOptions,
};
