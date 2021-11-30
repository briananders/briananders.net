const fs = require('fs-extra');
const glob = require('glob');

module.exports = function finishHashing({ dir, completionFlags, buildEvents, hashingFileNameList, debug }) {
  completionFlags.ASSET_HASH.DONE = false;

  const timestamp = require(`${dir.build}timestamp`);

  console.log(`${timestamp.stamp()} finishHashing()`);

  if (debug) console.log(`${timestamp.stamp()} finishHashing(): ${Object.keys(hashingFileNameList)}`);
  if (debug) console.log(`${timestamp.stamp()} finishHashing(): completionFlags.ASSET_HASH.IMAGES :${completionFlags.ASSET_HASH.IMAGES}`);
  if (debug) console.log(`${timestamp.stamp()} finishHashing(): completionFlags.ASSET_HASH.CSS    :${completionFlags.ASSET_HASH.CSS}`);
  if (debug) console.log(`${timestamp.stamp()} finishHashing(): completionFlags.ASSET_HASH.JS     :${completionFlags.ASSET_HASH.JS}`);
  if (!completionFlags.ASSET_HASH.IMAGES ||
      !completionFlags.ASSET_HASH.CSS ||
      !completionFlags.ASSET_HASH.JS) {
    return false;
  }
  if (debug) console.log(`${timestamp.stamp()} finishHashing(): ${Object.keys(hashingFileNameList)}`);
  const htmlGlob = glob.sync(`${dir.package}**/*.html`);
  let htmlFilesProcessed = 0;
  htmlGlob.forEach((file, index, array) => {
    const fileBuffer = fs.readFileSync(file);
    let fileContents = fileBuffer.toString();
    let keysProcessed = 0;
    (Object.keys(hashingFileNameList)).forEach((key, keyIndex, keyArray) => {
      const fileName = key.split(dir.package)[1];
      const fileNameHash = hashingFileNameList[key].split(dir.package)[1];
      if (debug) console.log(`${timestamp.stamp()} finishHashing():: ${fileName}`);
      if (~fileContents.indexOf(fileName)) {
        fileContents = fileContents.split(fileName).join(fileNameHash);
      }
      keysProcessed++;
      if (keysProcessed >= keyArray.length) {
        fs.writeFile(file, fileContents, (err) => {
          if (err) throw err;
          if (debug) console.log(`${timestamp.stamp()} finishHashing()::: ${file}: ${'DONE'.bold.green}`);
          htmlFilesProcessed++;
          if (htmlFilesProcessed >= array.length) {
            console.log(`${timestamp.stamp()} finishHashing(): ${'DONE'.bold.green}`);
            completionFlags.ASSET_HASH.DONE = true;
            buildEvents.emit('hashing-done');
          }
        });
      }
    });
  });
};
