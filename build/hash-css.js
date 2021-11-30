const fs = require('fs-extra');
const glob = require('glob');
const XXHash = require('xxhash');

module.exports = function hashCSS({ dir, completionFlags, buildEvents, hashingFileNameList, debug }) {
  completionFlags.ASSET_HASH.CSS = false;

  const timestamp = require(`${dir.build}timestamp`);

  console.log(`${timestamp.stamp()} assetHashing().css`);

  const cssGlob = glob.sync(`${dir.package}**/*.css`);
  let processedCss = 0;
  cssGlob.forEach((file, index, array) => {
    const fileContents = fs.readFileSync(file);
    const hash = XXHash.hash(fileContents, 0xCAFEBABE);
    const hashedFileName = `${file.substr(0, file.lastIndexOf('.'))}-${hash}${file.substr(file.lastIndexOf('.'))}`;
    hashingFileNameList[file] = hashedFileName;
    fs.rename(file, hashedFileName, (err) => {
      if (err) throw err;
      if (debug) console.log(`${timestamp.stamp()} assetHashing().css: ${hashedFileName} renamed complete`);
      processedCss++;
      if (processedCss >= array.length) {
        completionFlags.ASSET_HASH.CSS = true;
        console.log(`${timestamp.stamp()} assetHashing().css: ${'DONE'.bold.green}`);
        buildEvents.emit('asset-hash-css-listed');
      }
    });
  });
};
