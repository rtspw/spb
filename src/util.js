'use strict';

const fs = require('fs');

function mkDirPromise(dirName) {
  return new Promise((fulfill, reject) => {
    fs.mkdir(`./${dirName}`, { recursive: true }, (dirAlreadyExists) => {
      if (dirAlreadyExists) reject(dirAlreadyExists);
      fulfill();
    });
  });
}

module.exports = {
  mkDirPromise,
};
