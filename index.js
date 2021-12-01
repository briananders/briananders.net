'use strict';

require('colors');

const dir = {
  root: `${__dirname}/`,
  src: `${__dirname}/src/`,
  package: `${__dirname}/package/`,
  build: `${__dirname}/build/`,
  jsOutputPath: `${__dirname}/package/scripts/`,
  nodeModules: `${__dirname}/node_modules/`,
};

const completionFlags = {
  JS_IS_MINIFIED: false,
  CSS_IS_MINIFIED: false,
  HTML_IS_MINIFIED: false,
  IMAGES_ARE_MOVED: false,
  ASSET_HASH: {
    IMAGES: false,
    CSS: false,
    JS: false,
    DONE: false,
  },
  SITE_MAP: false,
  IMAGE_COMPRESSION: false,
  GZIP: false,
  PREVIEW_READY: false,
};

const BUILD_EVENTS = {
  assetHashCssListed: 'asset-hash-css-listed',
  assetHashImagesListed: 'asset-hash-images-listed',
  assetHashJsListed: 'asset-hash-js-listed',
  gzipDone: 'gzip-done',
  hashingDone: 'hashing-done',
  htmlMinified: 'html-minified',
  imageCompressionDone: 'image-compression-done',
  imagesMoved: 'images-moved',
  indexCssForHashing: 'index-css-for-hashing',
  jsMinified: 'js-minified',
  jsMoved: 'js-moved',
  sitemapDone: 'sitemap-done',
  stylesMoved: 'styles-moved',
  templatesMoved: 'templates-moved',
  pageMappingDataCompiled: 'page-mapping-data-compiled',
  previewReady: 'preview-ready',
}

const { log } = console;

const debug = process.argv.includes('--verbose');

const timestamp = require(`${dir.build}timestamp`);
const fs = require('fs-extra');
const express = require('express');
const serve = require('express-static');
const EventEmitter = require('events');
const production = require(`${dir.build}production`);
const app = express();
const buildEvents = new EventEmitter();

const hashingFileNameList = {};
const pageMappingData = [];

const configs = {
  BUILD_EVENTS,
  buildEvents,
  completionFlags,
  debug,
  dir,
  hashingFileNameList,
  pageMappingData,
};

// /////////////////////////////// compile tasks /////////////////////////////////

const assetHashing = require(`${dir.build}asset-hashing`);
const bundleEJS = require(`${dir.build}bundle-ejs`);
const bundleJS = require(`${dir.build}bundle-js`);
const bundleSCSS = require(`${dir.build}bundle-scss`);
const checkDone = require(`${dir.build}check-done`);
const clean = require(`${dir.build}clean`);
const compilePageMappingData = require(`${dir.build}page-mapping-data`);
const compressImages = require(`${dir.build}compress-images`);
const finishHashing = require(`${dir.build}finish-hashing`);
const gzipFiles = require(`${dir.build}gzip-files`);
const hashCSS = require(`${dir.build}hash-css`);
const minifyHTML = require(`${dir.build}minify-html`);
const minifyJS = require(`${dir.build}minify-js`);
const moveImages = require(`${dir.build}move-images`);
const sitemap = require(`${dir.build}sitemap`);
const updateCSSwithImageHashes = require(`${dir.build}update-css-with-image-hashes`);
const prodBuilder = require(`${dir.build}prod-builder`);
const previewBuilder = require(`${dir.build}preview-builder`);

// /////////////////////////////////////// event listeners ////////////////////////////////////////

buildEvents.on(BUILD_EVENTS.pageMappingDataCompiled, bundleEJS.bind(this, configs));
buildEvents.on(BUILD_EVENTS.pageMappingDataCompiled, sitemap.bind(this, configs));
buildEvents.on(BUILD_EVENTS.previewReady, log.bind(this, `${timestamp.stamp()} ${'Preview Ready'.green.bold}`));

if (!production) {
  previewBuilder(configs);
} else {
  prodBuilder(configs);
}

/* ////////////////////////////////////////////////////////////////////////// */
/* ////////////////////////////// initializers ////////////////////////////// */
/* ////////////////////////////////////////////////////////////////////////// */

log(`production: ${production}`.toUpperCase().brightBlue.bold);

clean(configs).then(() => {
  if (debug) log(`${timestamp.stamp()} clean().then()`);
  fs.mkdirp(dir.package);
  compilePageMappingData(configs);
  bundleJS(configs);
  bundleSCSS(configs);
  moveImages(configs);

  // buildEvents.emit(BUILD_EVENTS.previewReady);
});

if (!production) {
  app.use(serve(dir.package));

  const server = app.listen(3000, () => {
    log(`${timestamp.stamp()} server is running at %s`, server.address().port);
    // log('If on chrostini, run `hostname -I` to get the localhost IP address');
  });
}
