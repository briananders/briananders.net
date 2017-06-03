const fs = require('fs-extra');
const glob = require('glob');

module.exports = function updateCSSwithImageHashes(dir, completionFlags, buildEvents, hashingFileNameList) {
  const timestamp = require(`${dir.build}timestamp`);

  const cssGlob = glob.sync(`${dir.package}**/*.css`);
  let processedCss = 0;
  cssGlob.forEach((file, index, array) => {
    const fileBuffer = fs.readFileSync(file);
    let fileContents = fileBuffer.toString();
    let keysProcessed = 0;
    (Object.keys(hashingFileNameList)).forEach((key, keyIndex, keyArray) => {
      const fileName = key.split(dir.package)[1];
      const fileNameHash = hashingFileNameList[key].split(dir.package)[1];
      console.log(`${timestamp.stamp()}: finishHashing():: ${fileName}`);
      if (~fileContents.indexOf(fileName)) {
        fileContents = fileContents.split(fileName).join(fileNameHash);
      }
      keysProcessed++;
      if (keysProcessed >= keyArray.length) {
        fs.writeFile(file, fileContents, (err) => {
          if (err) throw err;
          console.log(`${timestamp.stamp()}: finishHashing()::: ${file}: ${'DONE'.bold.green}`);
          processedCss++;
          if (processedCss >= array.length) {
            console.log(`${timestamp.stamp()}: assetHashing(): ${'CSS UPDATES ARE DONE'.bold.red}`);
            buildEvents.emit('index-css-for-hashing');
          }
        });
      }
    });
  });
};
