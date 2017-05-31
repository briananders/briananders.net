const fs = require('fs-extra');
const glob = require('glob');
const zlib = require('zlib');

module.exports = function gzipFiles(dir, completionFlags, buildEvents) {
  const timestamp = require(`${dir.build}timestamp`);

  console.log(`${timestamp.stamp()}: gzip()`);

  const cssGlob = glob.sync(`${dir.package}**/*.css`);
  const jsGlob = glob.sync(`${dir.package}**/*.js`);
  const htmlGlob = glob.sync(`${dir.package}**/*.html`);
  const overallGlob = [].concat(cssGlob, jsGlob, htmlGlob);

  let processed = 0;
  console.log(`overallGlob: ${overallGlob.length} \n\n ${overallGlob} \n`);

  overallGlob.forEach((file) => {
    fs.readFile(file, (error) => {
      if (error) throw error;
      zlib.gzip(file, (err, result) => {
        if (err) throw err;
        fs.writeFile(`${file}.gz`, result, (e) => {
          if (e) throw e;
          console.log(`${timestamp.stamp()}: gzip: ${file} ${'complete'.bold.green}`);
          processed++;
          if (processed >= overallGlob.length) {
            console.log(`${timestamp.stamp()}: gzip: ${'DONE'.bold.green}`);
            completionFlags.GZIP = true;
            buildEvents.emit('gzip-done');
          }
        });
      });
    });
  });
};
