'use strict';

const dir = require('./build/constants/directories')(__dirname);

/* //////////////////////////// node modules //////////////////////////////// */

require('colors');
const fs = require('fs-extra');
const express = require('express');
const serve = require('express-static');
const EventEmitter = require('events');

/* //////////////////////////// local packages ////////////////////////////// */

const timestamp = require(`${dir.build}timestamp`);
const production = require(`${dir.build}production`);

const bundleEJS = require(`${dir.build}bundle-ejs`);
const bundleJS = require(`${dir.build}bundle-js`);
const bundleSCSS = require(`${dir.build}bundle-scss`);
const clean = require(`${dir.build}clean`);
const compilePageMappingData = require(`${dir.build}page-mapping-data`);
const moveImages = require(`${dir.build}move-images`);
const sitemap = require(`${dir.build}sitemap`);
const prodBuilder = require(`${dir.build}prod-builder`);
const previewBuilder = require(`${dir.build}preview-builder`);

const completionFlags = require(`${dir.build}constants/completion-flags`);
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
  completionFlags,
  debug,
  dir,
  hashingFileNameList,
  pageMappingData,
};

/* ////////////////////////////// event listeners /////////////////////////// */

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
});

if (!production) {
  app.use(serve(dir.package));

  const server = app.listen(3000, () => {
    log(`${timestamp.stamp()} server is running at %s`, server.address().port);
    // log('If on chrostini, run `hostname -I` to get the localhost IP address');
  });
}
