'use strict';

const Logger = require('./src/logger');

try {
  const t = new Logger({
    timezone: 'pst',
    watermelon: true,
  });
  
} catch(e) {
  console.log('Error:', e.message);
}
