const { isProduction } = require('./environment');
const { log } = console;

module.exports = (...args) => {
  if (!isProduction) log(...args);
};
