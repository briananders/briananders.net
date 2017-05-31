const fs = require('fs-extra');
const glob = require('glob');
const UglifyJS = require('uglify-js');

module.exports = function minifyJS(dir, completionFlags, buildEvents) {
  const timestamp = require(`${dir.build}timestamp`);

  console.log(`${timestamp.stamp()}: minifyJS()`);

  const jsGlob = glob.sync(`${dir.package}**/*.js`);
  let processed = 0;

  jsGlob.forEach((jsFileName, index, array) => {
    fs.readFile(jsFileName, (error, data) => {
      if (error) throw error;

      const uglifiedJS = UglifyJS.minify(data.toString());

      if (uglifiedJS.error) throw 'uglifiedJS.error'.red;

      fs.writeFile(jsFileName, uglifiedJS.code, (err) => {
        if (err) throw err;
        processed++;

        if (processed === array.length) {
          console.log(`${timestamp.stamp()}: ${'minifyJS completionFlags'.bold.green}`);
          completionFlags.JS_IS_MINIFIED = true;
          buildEvents.emit('js-minified');
        }
      });
    });
  });
};
