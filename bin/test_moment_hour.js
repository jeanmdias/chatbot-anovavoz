#!/usr/bin/env node

var moment = require('moment');
var moment_hour = moment().hour();

console.log('moment_hour',moment_hour);

if (moment_hour >= 8 && moment_hour <= 20) {
  console.log('true');
} else {
  console.log('false');
}
