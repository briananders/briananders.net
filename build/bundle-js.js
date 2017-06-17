const fs = require('fs-extra');
const mkdirp = require('mkdirp');

module.exports = function bundleJS(dir, completionFlags, buildEvents, browserify) {
  const timestamp = require(`${dir.build}timestamp`);

  console.log(`${timestamp.stamp()}: bundleJS()`);

  mkdirp(dir.jsOutputPath, (error) => {
    if (error) throw error;
    browserify.transform('babelify', { presets: ['es2015', 'react'] })
    .bundle()
    .pipe(fs.createWriteStream(`${dir.jsOutputPath}main.js`)
      .on('finish', () => {
        console.log(`${timestamp.stamp()}: ${'JAVASCRIPT BROWSERIFIED'.green.bold}`);
        buildEvents.emit('js-moved');
      })
    );
    console.log(`${timestamp.stamp()}: ${'SUCCESS'.green} - Compiled JS`);
  });
};
