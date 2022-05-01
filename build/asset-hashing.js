const fs = require('fs-extra');
const glob = require('glob');
const XXHash = require('xxhash');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

module.exports = function assetHashing({
  dir, completionFlags, buildEvents, hashingFileNameList, debug,
}) {
  completionFlags.ASSET_HASH.IMAGES = false;
  completionFlags.ASSET_HASH.JS = false;

  const timestamp = require(`${dir.build}timestamp`);

  if (!completionFlags.JS_IS_MINIFIED
      || !completionFlags.CSS_IS_MINIFIED
      || !completionFlags.HTML_IS_MINIFIED
      || !completionFlags.IMAGES_ARE_MOVED
      || !completionFlags.VIDEOS_ARE_MOVED) {
    return false;
  }
  log(`${timestamp.stamp()} assetHashing().images`);
  if (debug) {
    log(`completionFlags.JS_IS_MINIFIED :${completionFlags.JS_IS_MINIFIED}`);
    log(`completionFlags.CSS_IS_MINIFIED    :${completionFlags.CSS_IS_MINIFIED}`);
    log(`completionFlags.HTML_IS_MINIFIED     :${completionFlags.HTML_IS_MINIFIED}`);
    log(`completionFlags.IMAGES_ARE_MOVED     :${completionFlags.IMAGES_ARE_MOVED}`);
    log(`completionFlags.VIDEOS_ARE_MOVED     :${completionFlags.VIDEOS_ARE_MOVED}`);
  }

  const jsGlob = glob.sync(`${dir.package}**/*.js`);
  const assetGlob = glob.sync(`${dir.package}{images,videos}/**/*.{png,svg,jpg,webm,mp4}`);

  let processedJs = 0;
  jsGlob.forEach((file, index, array) => {
    const fileContents = fs.readFileSync(file);
    const hash = XXHash.hash(fileContents, 0xCAFEBABE);
    const hashedFileName = `${file.substr(0, file.lastIndexOf('.'))}-${hash}${file.substr(file.lastIndexOf('.'))}`;
    hashingFileNameList[file] = hashedFileName;
    fs.rename(file, hashedFileName, (err) => {
      if (err) throw err;
      if (debug) log(`${timestamp.stamp()} assetHashing().images: ${hashedFileName} renamed complete`);
      processedJs++;
      if (processedJs >= array.length) {
        completionFlags.ASSET_HASH.JS = true;
        if (debug) log(`${timestamp.stamp()} assetHashing().images: completionFlags.ASSET_HASH.JS: ${completionFlags.ASSET_HASH.JS}`);
        buildEvents.emit(BUILD_EVENTS.assetHashJsListed);
      }
    });
  });
  let processedImages = 0;
  assetGlob.forEach((file, index, array) => {
    const fileContents = fs.readFileSync(file);
    const hash = XXHash.hash(fileContents, 0xCAFEBABE);
    const hashedFileName = `${file.substr(0, file.lastIndexOf('.'))}-${hash}${file.substr(file.lastIndexOf('.'))}`;
    hashingFileNameList[file] = hashedFileName;
    fs.rename(file, hashedFileName, (err) => {
      if (err) throw err;
      if (debug) log(`${timestamp.stamp()} assetHashing().images: ${hashedFileName} renamed complete`);
      processedImages++;
      if (processedImages >= array.length) {
        completionFlags.ASSET_HASH.IMAGES = true;
        log(`${timestamp.stamp()} assetHashing().images: ${'DONE'.bold.green}`);
        buildEvents.emit(BUILD_EVENTS.assetHashImagesListed);
      }
    });
  });
};
