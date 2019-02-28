'use strict';

const fs = require('fs');

function mkDirPromise(dirName) {
  return new Promise((fulfill, reject) => {
    fs.mkdir(`./${dirName}`, { recursive: true }, (err) => {
      if (err) reject(err);
      fulfill();
    });
  });
}

function readDirPromise(dirName) {
  return new Promise((fulfill, reject) => {
    fs.readdir(dirName, (err, files) => {
      
    });
  });
}

module.exports = {
  mkDirPromise,
};
