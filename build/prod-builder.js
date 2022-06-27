const assetHashing = require('./asset-hashing');
const checkDone = require('./check-done');
const finishHashing = require('./finish-hashing');
const gzipFiles = require('./gzip-files');
const hashCSS = require('./hash-css');
const minifyHTML = require('./minify-html');
const minifyJS = require('./minify-js');
const updateCSSwithImageHashes = require('./update-css-with-image-hashes');

const BUILD_EVENTS = require('./constants/build-events');

module.exports = (configs) => {
  const { buildEvents } = configs;

  buildEvents.on(BUILD_EVENTS.assetHashCssListed, finishHashing.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.assetHashImagesListed, () => {
    updateCSSwithImageHashes(configs);
    finishHashing(configs);
  });
  buildEvents.on(BUILD_EVENTS.assetHashJsListed, finishHashing.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.gzipDone, checkDone.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.hashingDone, () => {
    checkDone(configs);
    gzipFiles(configs);
  });
  buildEvents.on(BUILD_EVENTS.htmlMinified, assetHashing.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.imagesMoved, () => {
    assetHashing(configs);
  });
  buildEvents.on(BUILD_EVENTS.indexCssForHashing, hashCSS.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.jsMinified, assetHashing.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.jsMoved, minifyJS.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.sitemapDone, checkDone.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.stylesMoved, assetHashing.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.templatesMoved, minifyHTML.bind(this, configs));
};
