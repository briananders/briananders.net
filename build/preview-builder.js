const chokidar = require('chokidar');

const assetHashing = require('./asset-hashing');
const bundleEJS = require('./bundle-ejs');
const bundleJS = require('./bundle-js');
const bundleSCSS = require('./bundle-scss');
const checkDone = require('./check-done');
const clean = require('./clean');
const compilePageMappingData = require('./page-mapping-data');
const compressImages = require('./compress-images');
const finishHashing = require('./finish-hashing');
const gzipFiles = require('./gzip-files');
const hashCSS = require('./hash-css');
const minifyHTML = require('./minify-html');
const minifyJS = require('./minify-js');
const moveImages = require('./move-images');
const sitemap = require('./sitemap');
const updateCSSwithImageHashes = require('./update-css-with-image-hashes');

module.exports = (configs) => {
  const { dir } = configs;

  chokidar.watch(`${dir.src}js/`)
    .on('change', (path) => {
      log(`${timestamp.stamp()} File modified: JavaScript: ${path}`.yellow);
      bundleJS(configs);
    });

  chokidar.watch(`${dir.src}styles/`)
    .on('change', (path) => {
      log(`${timestamp.stamp()} File modified: SCSS: ${path}`.yellow);
      bundleSCSS(configs);
    });

  chokidar.watch(`${dir.src}templates/`)
    .on('change', (path) => {
      log(`${timestamp.stamp()} File modified: Template: ${path}`.yellow);
      compilePageMappingData(configs);
    });

  chokidar.watch(`${dir.src}partials/`)
    .on('change', (path) => {
      log(`${timestamp.stamp()} File modified: Partial: ${path}`.yellow);
      compilePageMappingData(configs);
    });

  chokidar.watch(`${dir.src}layout/`)
    .on('change', (path) => {
      log(`${timestamp.stamp()} File modified: Layout: ${path}`.yellow);
      compilePageMappingData(configs);
    });

  chokidar.watch(`${dir.src}images/`)
    .on('change', (path) => {
      log(`${timestamp.stamp()} File modified: image: ${path}`.yellow);
      moveImages(configs);
    });

  chokidar.watch(`${dir.build}`)
    .on('change', (path) => {
      log(`${timestamp.stamp()} Build file modified: ${path}\n\nRestart the server`.red);
      process.exit();
    });
};