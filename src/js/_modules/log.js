const { isProduction } = require('./environment');

module.exports = (...args) => {
  if (!isProduction) {
    console.log(...args);
  }
};
