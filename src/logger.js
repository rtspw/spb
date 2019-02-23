'use strict';

function __sanitizeOptions(options) {
  let {
    timezone = 'GMT',
  } = options;

  if (typeof timezone !== 'string' || timezone.length !== 3) {
    throw new Error('Invalid timezone format');
  }

  timezone = timezone.toUpperCase();
  return { timezone };
}


class Logger {
  constructor(options) {
    const sanitizedOptions = __sanitizeOptions(options);
    Object.assign(this, sanitizedOptions);
    console.log(this);
  }
}

module.exports = Logger;
