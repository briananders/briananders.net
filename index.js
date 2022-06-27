'use strict';

/* //////////////////////////// node modules //////////////////////////////// */

require('colors');
const fs = require('fs-extra');
const express = require('express');
const serve = require('express-static');
const EventEmitter = require('events');
const dir = require('./build/constants/directories')(__dirname);

/* //////////////////////////// local packages ////////////////////////////// */

const timestamp = require(`${dir.build}timestamp`);
const production = require(`${dir.build}production`);

const bundleEJS = require(`${dir.build}bundle-ejs`);
const bundleJS = require(`${dir.build}bundle-js`);
const bundleSCSS = require(`${dir.build}bundle-scss`);
const clean = require(`${dir.build}clean`);
const compilePageMappingData = require(`${dir.build}page-mapping-data`);
const convertToWebp = require(`${dir.build}convert-to-webp`);
const optimizeSvgs = require(`${dir.build}optimize-svgs`);
const moveImages = require(`${dir.build}move-images`);
const previewBuilder = require(`${dir.build}preview-builder`);
const prodBuilder = require(`${dir.build}prod-builder`);
const sitemap = require(`${dir.build}sitemap`);

const completionFlagsSource = require(`${dir.build}constants/completion-flags`);
const BUILD_EVENTS = require(`${dir.build}constants/build-events`);

/* ///////////////////////////// local variables //////////////////////////// */

const { log } = console;
const debug = process.argv.includes('--verbose');

const app = express();
const buildEvents = new EventEmitter();

const hashingFileNameList = {};
const pageMappingData = [];

const configs = {
  BUILD_EVENTS,
  buildEvents,
  completionFlags: completionFlagsSource,
  debug,
  dir,
  hashingFileNameList,
  pageMappingData,
};

function srcImagesReady(configs) {
  const { completionFlags } = configs;

  if (completionFlags.SVG_OPTIMIZATION && completionFlags.IMAGES_TO_WEBP) {
    moveImages(configs);
  }
}

/* ////////////////////////////// event listeners /////////////////////////// */

buildEvents.on(BUILD_EVENTS.imagesConverted, compilePageMappingData.bind(this, configs));
buildEvents.on(BUILD_EVENTS.imagesConverted, bundleEJS.bind(this, configs));
buildEvents.on(BUILD_EVENTS.imagesConverted, srcImagesReady.bind(this, configs));
buildEvents.on(BUILD_EVENTS.svgsOptimized, srcImagesReady.bind(this, configs));
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
  convertToWebp(configs);
  optimizeSvgs(configs);
});

if (!production) {
  app.use(serve(dir.package));

  const server = app.listen(3000, () => {
    log(`${timestamp.stamp()} server is running at http://localhost:%s`, server.address().port);
    // log('If on chrostini, run `hostname -I` to get the localhost IP address');
  });
}
