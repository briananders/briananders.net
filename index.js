'use strict';

require('colors');

const dir = {
  root: `${__dirname}/`,
  src: `${__dirname}/src/`,
  package: `${__dirname}/package/`,
  build: `${__dirname}/build/`,
  jsOutputPath: `${__dirname}/package/scripts/`,
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

const timestamp = require(`${dir.build}timestamp`);
const fs = require('fs-extra');
const browserify = require('browserify');
const watchify = require('watchify');
const express = require('express');
const serve = require('express-static');
const EventEmitter = require('events');
const production = require(`${dir.build}production`);
const app = express();
const buildEvents = new EventEmitter();
const exec = require('child_process').exec;

const __browserify = browserify({
  entries: [`${dir.src}js/main.js`],
  cache: {},
  packageCache: {},
  plugin: [watchify],
});

const hashingFileNameList = {};
const pageMappingData = [];


// /////////////////////////////// compile tasks /////////////////////////////////


const bundleSCSS = require(`${dir.build}bundle-scss`);
const bundleJS = require(`${dir.build}bundle-js`);
const moveEmberJs = require(`${dir.build}move-ember-js`);
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


buildEvents.on('page-mapping-data-compiled', bundleEJS.bind(this, dir, completionFlags, buildEvents, pageMappingData));
buildEvents.on('page-mapping-data-compiled', sitemap.bind(this, dir, completionFlags, buildEvents, pageMappingData));

if (!production) {
  __browserify.on('update', (file) => {
    console.log(`${timestamp.stamp()}: File modified: JavaScript: ${file}`);
    bundleJS(dir, completionFlags, buildEvents, __browserify);
  });


  fs.watch(`${dir.src}ember-app/dist/assets/`, {
    recursive: true,
  }, (evt, file) => {
    console.log(`${timestamp.stamp()}: File modified: Ember: ${file}`);
    moveEmberJs(dir, completionFlags, buildEvents);
  });


  fs.watch(`${dir.src}styles/`, {
    recursive: true,
  }, (evt, file) => {
    console.log(`${timestamp.stamp()}: File modified: SCSS: ${file}`);
    bundleSCSS(dir, completionFlags, buildEvents);
  });


  fs.watch(`${dir.src}templates/`, {
    recursive: true,
  }, (evt, file) => {
    console.log(`${timestamp.stamp()}: File modified: Template: ${file}`);
    compilePageMappingData(dir, buildEvents, pageMappingData);
  });


  fs.watch(`${dir.src}partials/`, {
    recursive: true,
  }, (evt, file) => {
    console.log(`${timestamp.stamp()}: File modified: Partial: ${file}`);
    compilePageMappingData(dir, buildEvents, pageMappingData);
  });


  fs.watch(`${dir.src}layout/`, {
    recursive: true,
  }, (evt, file) => {
    console.log(`${timestamp.stamp()}: File modified: Layout: ${file}`);
    compilePageMappingData(dir, buildEvents, pageMappingData);
  });


  fs.watch(`${dir.src}images/`, {
    recursive: true,
  }, (evt, file) => {
    console.log(`${timestamp.stamp()}: File modified: image: ${file}`);
    moveImages(dir, completionFlags, buildEvents);
  });
} else {
  buildEvents.on('templates-moved', minifyHTML.bind(this, dir, completionFlags, buildEvents));
  buildEvents.on('js-moved', minifyJS.bind(this, dir, completionFlags, buildEvents));
  buildEvents.on('styles-moved', assetHashing.bind(this, dir, completionFlags, buildEvents, hashingFileNameList));
  buildEvents.on('js-minified', assetHashing.bind(this, dir, completionFlags, buildEvents, hashingFileNameList));
  buildEvents.on('html-minified', assetHashing.bind(this, dir, completionFlags, buildEvents, hashingFileNameList));
  buildEvents.on('images-moved', assetHashing.bind(this, dir, completionFlags, buildEvents, hashingFileNameList));
  buildEvents.on('images-moved', compressImages.bind(this, dir, completionFlags, buildEvents));
  buildEvents.on('asset-hash-images-listed', updateCSSwithImageHashes.bind(this, dir, completionFlags, buildEvents, hashingFileNameList));
  buildEvents.on('index-css-for-hashing', hashCSS.bind(this, dir, completionFlags, buildEvents, hashingFileNameList));
  buildEvents.on('asset-hash-js-listed', finishHashing.bind(this, dir, completionFlags, buildEvents, hashingFileNameList));
  buildEvents.on('asset-hash-css-listed', finishHashing.bind(this, dir, completionFlags, buildEvents, hashingFileNameList));
  buildEvents.on('asset-hash-images-listed', finishHashing.bind(this, dir, completionFlags, buildEvents, hashingFileNameList));
  buildEvents.on('hashing-done', gzipFiles.bind(this, dir, completionFlags, buildEvents));
  buildEvents.on('gzip-done', checkDone.bind(this, dir, completionFlags, buildEvents));
  buildEvents.on('hashing-done', checkDone.bind(this, dir, completionFlags, buildEvents));
  buildEvents.on('sitemap-done', checkDone.bind(this, dir, completionFlags, buildEvents));
  buildEvents.on('image-compression-done', checkDone.bind(this, dir, completionFlags, buildEvents));
}


// ///////////////////////////////////////////// initializers ///////////////////////////////////////////////


const clean = new Promise((resolve, reject) => {
  console.log(`${timestamp.stamp()}: clean()`);

  exec(`rm -rf ${dir.package}**`, (error) => {
    if (error) {
      console.log(error);
      reject();
    } else {
      resolve();
    }
  });
});

clean.then(() => {
  console.log(`${timestamp.stamp()}: clean.then()`);
  compilePageMappingData(dir, buildEvents, pageMappingData);
  bundleJS(dir, completionFlags, buildEvents, __browserify);
  moveEmberJs(dir, completionFlags, buildEvents);
  bundleSCSS(dir, completionFlags, buildEvents);
  moveImages(dir, completionFlags, buildEvents);
});


if (!production) {
  app.use(serve(dir.package));

  const server = app.listen(3000, () => {
    console.log(`${timestamp.stamp()}: server is running at %s`, server.address().port);
  });
}
