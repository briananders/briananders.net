const fs = require('fs-extra');
const glob = require('glob');
const zlib = require('zlib');

module.exports = function gzipFiles({ dir, completionFlags, buildEvents, debug }) {
  completionFlags.GZIP = false;

  const timestamp = require(`${dir.build}timestamp`);

  console.log(`${timestamp.stamp()}: gzip()`);

  const overallGlob = glob.sync(`${dir.package}**/*.+(html|xml|css|js)`);

  let processed = 0;
  if (debug) console.log(`overallGlob: ${overallGlob.length} \n\n ${overallGlob} \n`);

  overallGlob.forEach((file) => {
    fs.readFile(file, (error) => {
      if (error) throw error;
      zlib.gzip(file, (err, result) => {
        if (err) throw err;
        fs.writeFile(`${file}.gz`, result, (e) => {
          if (e) throw e;
          if (debug) console.log(`${timestamp.stamp()}: gzip: ${file} ${'complete'.bold.green}`);
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
