const copy = require('copy');

module.exports = function moveEmberJs(dir, completionFlags, buildEvents) {
  const timestamp = require(`${dir.build}timestamp`);

  copy(`${dir.src}ember-app/dist/assets/*.js`, `${dir.jsOutputPath}ember-app`, (err) => {
    if (err) throw err;
    console.log(`${timestamp.stamp()}: ${'SUCCESS'.green} - Moved Ember App`);
  });
};
