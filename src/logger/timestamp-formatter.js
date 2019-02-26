'use strict';

const dayjsPluginForUTC = require('dayjs-plugin-utc');
const dayjs = require('dayjs').extend(dayjsPluginForUTC.default);

const __formatOptions = {};

function __validateOptions(options) {
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
    throw new Error('Must specify whether to use 12hr AM/PM or 24hr format using a boolean.');
  }

  if (typeof useFullYear !== 'boolean') {
    throw new Error('Must specify whether to use the full year format using a boolean.');
  }

  if (typeof showDayOfWeek !== 'boolean') {
    throw new Error('Must specify whether to show days of the week using a boolean.');
  }

  if (typeof showMilliseconds !== 'boolean') {
    throw new Error('Must specify whether to show milliseconds using a boolean.');
  }

  if (typeof showUTCOffset !== 'boolean') {
    throw new Error('Must specify whether to show UTC offset using a boolean.');
  }

  if (typeof dateSeparator !== 'string' || dateSeparator.length === 0) {
    throw new Error('Date Separator must be a string of at least one character.');
  }

  if (typeof timeSeparator !== 'string' || timeSeparator.length === 0) {
    throw new Error('Time Separator must be a string of at least one character.');
  }

  return {
    useAMPM,
    useFullYear,
    showDayOfWeek,
    showMilliseconds,
    showUTCOffset,
    dateSeparator,
    timeSeparator,
  };
}


function __buildFormatString() {
  const { dateSeparator: dSep, timeSeparator: tSep } = __formatOptions;
  const year = __formatOptions.useFullYear ? 'YYYY' : 'YY';
  const month = 'MM';
  const day = 'DD';
  const dayOfWeek = __formatOptions.showDayOfWeek ? 'ddd ' : '';
  const hour = __formatOptions.useAMPM ? 'hh' : 'HH';
  const min = 'mm';
  const sec = 'ss';
  const ms = __formatOptions.showMilliseconds ? `${tSep}SSS` : '';
  const AMPM = __formatOptions.useAMPM ? 'A' : '';
  const offset = __formatOptions.showUTCOffset ? ' [UTC]ZZ' : '';
  const formatString = `${year}${dSep}${month}${dSep}${day} ${dayOfWeek}${hour}${tSep}${min}${tSep}${sec}${ms}${AMPM}${offset}`;
  return formatString;
}

function __setPrivateFormatOptions(options = {}) {
  Object.assign(__formatOptions, options);
}


class TimestampFormatter {
  constructor(UTCOffset = 0, options = {}) {
    this.UTCOffset = UTCOffset;
    const validatedOptions = __validateOptions(options);
    __setPrivateFormatOptions(validatedOptions);
  }

  getTimestampWithOffset(offset = this.UTCOffset) {
    const UTCTime = dayjs.utc();
    const loggerTimeWithOffset = UTCTime.utcOffset(offset);
    const formatString = __buildFormatString();
    const formattedDate = loggerTimeWithOffset.format(formatString);
    return formattedDate;
  }
}

module.exports = TimestampFormatter;
