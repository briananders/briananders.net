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
}

const { log } = console;

const debug = process.argv.includes('--verbose');

const timestamp = require(`${dir.build}timestamp`);
const fs = require('fs-extra');
const chokidar = require('chokidar');
const express = require('express');
const serve = require('express-static');
const EventEmitter = require('events');
const production = require(`${dir.build}production`);
const app = express();
const buildEvents = new EventEmitter();
const { exec } = require('child_process');

const hashingFileNameList = {};
const pageMappingData = [];

const configs = {
  buildEvents,
  completionFlags,
  debug,
  dir,
  hashingFileNameList,
  pageMappingData,
  BUILD_EVENTS,
};

// /////////////////////////////// compile tasks /////////////////////////////////

const bundleSCSS = require(`${dir.build}bundle-scss`);
const bundleJS = require(`${dir.build}bundle-js`);
const bundleEJS = require(`${dir.build}bundle-ejs`);
const compilePageMappingData = require(`${dir.build}page-mapping-data`);
const moveImages = require(`${dir.build}move-images`);
const assetHashing = require(`${dir.build}asset-hashing`);
const hashCSS = require(`${dir.build}hash-css`);
const updateCSSwithImageHashes = require(`${dir.build}update-css-with-image-hashes`);
const finishHashing = require(`${dir.build}finish-hashing`);
const minifyJS = require(`${dir.build}minify-js`);
const minifyHTML = require(`${dir.build}minify-html`);
const sitemap = require(`${dir.build}sitemap`);
const compressImages = require(`${dir.build}compress-images`);
const gzipFiles = require(`${dir.build}gzip-files`);
const checkDone = require(`${dir.build}check-done`);

// /////////////////////////////////////// event listeners ////////////////////////////////////////

buildEvents.on(BUILD_EVENTS.pageMappingDataCompiled, bundleEJS.bind(this, configs));
buildEvents.on(BUILD_EVENTS.pageMappingDataCompiled, sitemap.bind(this, configs));

if (!production) {
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
} else {
  buildEvents.on(BUILD_EVENTS.assetHashCssListed, finishHashing.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.assetHashImagesListed, finishHashing.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.assetHashImagesListed, updateCSSwithImageHashes.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.assetHashJsListed, finishHashing.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.gzipDone, checkDone.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.hashingDone, checkDone.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.hashingDone, gzipFiles.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.htmlMinified, assetHashing.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.imageCompressionDone, checkDone.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.imagesMoved, assetHashing.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.imagesMoved, compressImages.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.indexCssForHashing, hashCSS.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.jsMinified, assetHashing.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.jsMoved, minifyJS.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.sitemapDone, checkDone.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.stylesMoved, assetHashing.bind(this, configs));
  buildEvents.on(BUILD_EVENTS.templatesMoved, minifyHTML.bind(this, configs));
}

/* ////////////////////////////////////////////////////////////////////////// */
/* ////////////////////////////// initializers ////////////////////////////// */
/* ////////////////////////////////////////////////////////////////////////// */

const clean = new Promise((resolve, reject) => {
  log(`${timestamp.stamp()} clean()`);

  fs.emptyDir(dir.package, (error) => {
    if (error) {
      log(error);
      reject();
    } else {
      resolve();
    }
  })
});

log(`production: ${production}`.toUpperCase().brightBlue.bold);

clean.then(() => {
  if (debug) log(`${timestamp.stamp()} clean.then()`);
  fs.mkdirp(dir.package);
  compilePageMappingData(configs);
  bundleJS(configs);
  bundleSCSS(configs);
  moveImages(configs);
});

if (!production) {
  app.use(serve(dir.package));

  const server = app.listen(3000, () => {
    log(`${timestamp.stamp()} server is running at %s`, server.address().port);
    // log('If on chrostini, run `hostname -I` to get the localhost IP address');
  });
}
