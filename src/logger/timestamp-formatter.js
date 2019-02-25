'use strict';

const dayjsPluginForUTC = require('dayjs-plugin-utc');
const dayjs = require('dayjs').extend(dayjsPluginForUTC.default);

function __sanitizeOptions(options) {
  const {
    useAMPM = false,
    useFullYear = true,
    showDayOfWeek = true,
    showMilliseconds = false,
    showUTCOffset = false,
    dateSeparator = '-',
    timeSeparator = ':',
  } = options;

  if (typeof useAMPM !== 'boolean') {
    throw new Error('Must specify whether to use 12hr AM/PM or 24hr format using a boolean');
  }

  if (typeof useFullYear !== 'boolean') {
    throw new Error('Must specify whether to use the full year format using a boolean');
  }

  if (typeof showDayOfWeek !== 'boolean') {
    throw new Error('Must specify whether to show days of the week using a boolean');
  }

  if (typeof showMilliseconds !== 'boolean') {
    throw new Error('Must specify whether to show milliseconds using a boolean');
  }

  if (typeof showUTCOffset !== 'boolean') {
    throw new Error('Must specify whether to show UTC offset using a boolean');
  }

  if (typeof dateSeparator !== 'string' || dateSeparator.length === 0) {
    throw new Error('Date Separator must be a string of at least one character');
  }

  if (typeof timeSeparator !== 'string' || timeSeparator.length === 0) {
    throw new Error('Time Separator must be a string of at least one character');
  }

  return {
    formatOptions: {
      useAMPM,
      useFullYear,
      showDayOfWeek,
      showMilliseconds,
      showUTCOffset,
      dateSeparator,
      timeSeparator,
    },
  };
}


function __buildFormatString(formatOptions) {
  const { dateSeparator: dSep, timeSeparator: tSep } = formatOptions;
  const year = formatOptions.useFullYear ? 'YYYY' : 'YY';
  const month = 'MM';
  const day = 'DD';
  const dayOfWeek = formatOptions.showDayOfWeek ? 'ddd ' : '';
  const hour = formatOptions.useAMPM ? 'hh' : 'HH';
  const min = 'mm';
  const sec = 'ss';
  const ms = formatOptions.showMilliseconds ? `${tSep}SSS` : '';
  const AMPM = formatOptions.useAMPM ? 'A' : '';
  const offset = formatOptions.showUTCOffset ? ' [UTC]ZZ' : '';
  const formatString = `${year}${dSep}${month}${dSep}${day} ${dayOfWeek}${hour}${tSep}${min}${tSep}${sec}${ms}${AMPM}${offset}`;
  return formatString;
}


class TimestampFormatter {
  constructor(UTCOffset = 0, options = {}) {
    this.UTCOffset = UTCOffset;
    const sanitizedOptions = __sanitizeOptions(options);
    Object.assign(this, sanitizedOptions);
  }

  getTimestampWithOffset(offset = this.UTCOffset) {
    const UTCTime = dayjs.utc();
    const loggerTimeWithOffset = UTCTime.utcOffset(offset);
    const formatString = __buildFormatString(this.formatOptions);
    const formattedDate = loggerTimeWithOffset.format(formatString);
    return formattedDate;
  }
}

module.exports = TimestampFormatter;
