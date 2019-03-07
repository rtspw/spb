'use strict';

class PermissionError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'PermissionError';
  }
}

module.exports = PermissionError;
