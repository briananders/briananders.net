'use strict';

const dir = {
  src: `${__dirname}/src/`,
  package: `${__dirname}/package/`,
  build: `${__dirname}/build/`,
};

require('colors');

const COMPLETE = {
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

const devBuild = (process.env.NODE_ENV || '').trim().toLowerCase() !== 'production';
const production = !devBuild;

const jsOutputPath = `${dir.package}scripts/`;

const timestamp = require(`${dir.build}timestamp`);
const fs = require('fs-extra');
const glob = require('glob');
const browserify = require('browserify');
const watchify = require('watchify');
const sass = require('node-sass');
const path = require('path');
const mkdirp = require('mkdirp');
const merge = require('merge');
const ejs = require('ejs');
const matter = require('gray-matter');
const copy = require('copy');
const express = require('express');
const serve = require('express-static');
const EventEmitter = require('events');
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-js');
const htmlMinify = require('html-minifier');
const XXHash = require('xxhash');

const app = express();
const buildEvents = new EventEmitter();

const ejsFunctions = require(`${dir.build}ejs-functions`);
const siteData = require(`${dir.build}site-data`);

const b = browserify({
  entries: [`${dir.src}js/main.js`],
  cache: {},
  packageCache: {},
  plugin: [watchify],
});

const hashingFileNameList = {};


// /////////////////////////////// compile tasks /////////////////////////////////


function bundleSCSS() {
  console.log(`${timestamp.stamp()}: bundleSCSS()`);
  const stylesGlob = glob.sync(`${dir.src}**/**/[^_]*.scss`);
  let processed = 0;
  stylesGlob.forEach((scssFilename, index, array) => {
    const outFile = scssFilename.replace(dir.src, dir.package).replace(/\.scss$/, '.css');

    console.log(`${timestamp.stamp()}: ${'REQUEST'.magenta} - Compiling SASS - ${outFile.split(/styles/)[1]}`);

    sass.render({
      file: scssFilename,
      outFile,
      includePaths: [`${dir.src}styles/`],
      sourceMap: true,
    }, (error, result) => { // node-style callback from v3.0.0 onwards
      if (error) throw error;
      // No errors during the compilation, write this result on the disk

      mkdirp(path.dirname(outFile), (err) => {
        if (err) throw err;
        let cssOutput;

        if (production) {
          cssOutput = new CleanCSS().minify(result.css).styles;
        } else {
          cssOutput = result.css;
        }

        fs.writeFile(outFile, cssOutput, (e) => {
          if (e) throw e;
          console.log(`${timestamp.stamp()}: ${'SUCCESS'.green} - Compiled SASS  - ${outFile.split(/styles/)[1]}`);
          processed++;

          if (processed === array.length) {
            console.log(`${timestamp.stamp()}: ${'STYLES DONE'.green.bold}`);
            COMPLETE.CSS_IS_MINIFIED = true;
            buildEvents.emit('styles-moved');
          }
        });
      });
    });
  });
}


function bundleJS() {
  console.log(`${timestamp.stamp()}: bundleJS()`);

  mkdirp(jsOutputPath, (error) => {
    if (error) throw error;
    b.transform('babelify', { presets: ['es2015', 'react'] })
     .bundle()
     .pipe(fs.createWriteStream(`${jsOutputPath}main.js`)
       .on('finish', () => {
         console.log(`${timestamp.stamp()}: ${'JAVASCRIPT BROWSERIFIED'.green.bold}`);
         buildEvents.emit('js-moved');
       })
      );
    console.log(`${timestamp.stamp()}: ${'SUCCESS'.green} - Compiled JS`);
  });

  copy(`${dir.src}ember-app/dist/assets/*.js`, `${jsOutputPath}ember-app`, (err) => {
    if (err) throw err;
    console.log(`${timestamp.stamp()}: ${'SUCCESS'.green} - Moved Ember App`);
  });
}


function bundleEJS() {
  console.log(`${timestamp.stamp()}: bundleEJS()`);
  const templateGlob = glob.sync(`${dir.src}templates/**/[^_]*.ejs`);
  let processed = 0;
  templateGlob.forEach((templatePath, index, array) => {
    console.log(`${timestamp.stamp()}: ${'REQUEST'.magenta} - Compiling Template - ${templatePath.split(/templates/)[1]}`);

    const outputPath = templatePath.replace(`${dir.src}templates/`, dir.package).replace(/\.ejs$/, (templatePath.includes('.html.ejs')) ? '' : '/index.html');

    const frontMatter = matter.read(templatePath);
    frontMatter.data.content = frontMatter.content;
    frontMatter.data = merge(frontMatter.data, ejsFunctions, siteData);

    const base = fs.readFileSync(`${dir.src}layout/${frontMatter.data.layout}.ejs`).toString();

    const html = ejs.render(base, frontMatter.data, {
      compileDebug: true,
      filename: templatePath,
      root: `${dir.src}templates/`,
    });

    mkdirp(path.dirname(outputPath), (error) => {
      if (error) throw error;
      fs.writeFile(outputPath, html);
      console.log(`${timestamp.stamp()}: ${'SUCCESS'.green} - Compiled Template - ${outputPath.split(/package/)[1]}`);
      processed++;

      if (processed === array.length) {
        console.log(`${timestamp.stamp()}: ${'TEMPLATES DONE'.green.bold}`);
        buildEvents.emit('templates-moved');
      }
    });
  });
}


function moveImages() {
  // move images over
  fs.copy(`${dir.src}images/`, `${dir.package}images/`, (err) => {
    if (err) throw err;
    console.log(`${timestamp.stamp()}: ${'SUCCESS'.green} - moved images`);
    COMPLETE.IMAGES_ARE_MOVED = true;
    buildEvents.emit('images-moved');
  });

  // move humans and robots text files
  copy(`${dir.src}*.txt`, `${dir.package}`, (err) => {
    if (err) throw err;
    console.log(`${timestamp.stamp()}: ${'SUCCESS'.green} - moved .txt files`);
  });
}


function assetHashing() {
  if (!COMPLETE.JS_IS_MINIFIED ||
      !COMPLETE.CSS_IS_MINIFIED ||
      !COMPLETE.HTML_IS_MINIFIED ||
      !COMPLETE.IMAGES_ARE_MOVED) {
    return false;
  }
  console.log(`${timestamp.stamp()}: assetHashing()`);
  console.log(`COMPLETE.JS_IS_MINIFIED :${COMPLETE.JS_IS_MINIFIED}`);
  console.log(`COMPLETE.CSS_IS_MINIFIED    :${COMPLETE.CSS_IS_MINIFIED}`);
  console.log(`COMPLETE.HTML_IS_MINIFIED     :${COMPLETE.HTML_IS_MINIFIED}`);
  console.log(`COMPLETE.IMAGES_ARE_MOVED     :${COMPLETE.IMAGES_ARE_MOVED}`);

  const jsGlob = glob.sync(`${dir.package}**/*.js`);
  const imagesGlob = glob.sync(`${dir.package}images/**/*.{png,svg,jpg}`);

  let processedJs = 0;
  jsGlob.forEach((file, index, array) => {
    const fileContents = fs.readFileSync(file);
    const hash = XXHash.hash(fileContents, 0xCAFEBABE);
    const hashedFileName = `${file.substr(0, file.lastIndexOf('.'))}-${hash}${file.substr(file.lastIndexOf('.'))}`;
    hashingFileNameList[file] = hashedFileName;
    fs.rename(file, hashedFileName, (err) => {
      if (err) throw err;
      console.log(`${timestamp.stamp()}: assetHashing(): ${hashedFileName} renamed complete`);
      processedJs++;
      if (processedJs >= array.length) {
        COMPLETE.ASSET_HASH.JS = true;
        console.log(`${timestamp.stamp()}: assetHashing(): COMPLETE.ASSET_HASH.JS: ${COMPLETE.ASSET_HASH.JS}`);
        buildEvents.emit('asset-hash-js-listed');
      }
    });
  });
  let processedImages = 0;
  imagesGlob.forEach((file, index, array) => {
    const fileContents = fs.readFileSync(file);
    const hash = XXHash.hash(fileContents, 0xCAFEBABE);
    const hashedFileName = `${file.substr(0, file.lastIndexOf('.'))}-${hash}${file.substr(file.lastIndexOf('.'))}`;
    hashingFileNameList[file] = hashedFileName;
    fs.rename(file, hashedFileName, (err) => {
      if (err) throw err;
      console.log(`${timestamp.stamp()}: assetHashing(): ${hashedFileName} renamed complete`);
      processedImages++;
      if (processedImages >= array.length) {
        COMPLETE.ASSET_HASH.IMAGES = true;
        console.log(`${timestamp.stamp()}: assetHashing(): COMPLETE.ASSET_HASH.IMAGES: ${COMPLETE.ASSET_HASH.IMAGES}`);
        buildEvents.emit('asset-hash-images-listed');
      }
    });
  });
}


function hashCSS() {
  const cssGlob = glob.sync(`${dir.package}**/*.css`);
  let processedCss = 0;
  cssGlob.forEach((file, index, array) => {
    const fileContents = fs.readFileSync(file);
    const hash = XXHash.hash(fileContents, 0xCAFEBABE);
    const hashedFileName = `${file.substr(0, file.lastIndexOf('.'))}-${hash}${file.substr(file.lastIndexOf('.'))}`;
    hashingFileNameList[file] = hashedFileName;
    fs.rename(file, hashedFileName, (err) => {
      if (err) throw err;
      console.log(`${timestamp.stamp()}: assetHashing(): ${hashedFileName} renamed complete`);
      processedCss++;
      if (processedCss >= array.length) {
        COMPLETE.ASSET_HASH.CSS = true;
        console.log(`${timestamp.stamp()}: assetHashing(): COMPLETE.ASSET_HASH.CSS: ${COMPLETE.ASSET_HASH.CSS}`);
        buildEvents.emit('asset-hash-css-listed');
      }
    });
  });
}


function updateCSSwithImageHashes() {
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
}


function finishHashing() {
  console.log(`${timestamp.stamp().red.bold}: finishHashing(): ${Object.keys(hashingFileNameList)}`);
  console.log(`${timestamp.stamp().red.bold}: finishHashing(): COMPLETE.ASSET_HASH.IMAGES :${COMPLETE.ASSET_HASH.IMAGES}`);
  console.log(`${timestamp.stamp().red.bold}: finishHashing(): COMPLETE.ASSET_HASH.CSS    :${COMPLETE.ASSET_HASH.CSS}`);
  console.log(`${timestamp.stamp().red.bold}: finishHashing(): COMPLETE.ASSET_HASH.JS     :${COMPLETE.ASSET_HASH.JS}`);
  if (!COMPLETE.ASSET_HASH.IMAGES ||
      !COMPLETE.ASSET_HASH.CSS ||
      !COMPLETE.ASSET_HASH.JS) {
    return false;
  }
  console.log(`${timestamp.stamp()}: finishHashing(): ${Object.keys(hashingFileNameList)}`);
  const htmlGlob = glob.sync(`${dir.package}**/*.html`);
  let htmlFilesProcessed = 0;
  htmlGlob.forEach((file, index, array) => {
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
          htmlFilesProcessed++;
          if (htmlFilesProcessed >= array.length) {
            console.log(`${timestamp.stamp().bold.green}: finishHashing(): ${'DONE'.bold.green}`);
            COMPLETE.ASSET_HASH.DONE = true;
            buildEvents.emit('hashing-done');
          }
        });
      }
    });
  });
}


function minifyJS() {
  console.log(`${timestamp.stamp()}: minifyJS()`);

  const jsGlob = glob.sync(`${dir.package}**/*.js`);
  let processed = 0;

  jsGlob.forEach((jsFileName, index, array) => {
    fs.readFile(jsFileName, (error, data) => {
      if (error) throw error;

      const uglifiedJS = UglifyJS.minify(data.toString());

      if (uglifiedJS.error) throw 'uglifiedJS.error'.red;

      fs.writeFile(jsFileName, uglifiedJS.code, (err) => {
        if (err) throw err;
        processed++;

        if (processed === array.length) {
          console.log(`${timestamp.stamp()}: ${'minifyJS COMPLETE'.bold.green}`);
          COMPLETE.JS_IS_MINIFIED = true;
          buildEvents.emit('js-minified');
        }
      });
    });
  });
}


function minifyHTML() {
  console.log(`${timestamp.stamp()}: minifyHTML()`);

  const htmlGlob = glob.sync(`${dir.package}**/*.html`);
  let processed = 0;

  htmlGlob.forEach((htmlFileName, index, array) => {
    console.log(`${timestamp.stamp()}: minifyHTML - ${htmlFileName.split('/package/')[1]}`);

    fs.readFile(htmlFileName, (error, data) => {
      if (error) throw error;

      const minifiedHtml = htmlMinify.minify(data.toString(), {
        caseSensitive: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        html5: true,
        keepClosingSlash: true,
        minifyCSS: true,
        minifyJS: true,
        removeAttributeQuotes: true,
        removeComments: true,
        sortClassName: true,
        useShortDoctype: true,
      });

      fs.writeFile(htmlFileName, minifiedHtml, (err) => {
        if (err) throw err;
        processed++;

        if (processed === array.length) {
          console.log(`${timestamp.stamp()}: ${'minifyHTML COMPLETE'.bold.green}`);
          COMPLETE.HTML_IS_MINIFIED = true;
          buildEvents.emit('html-minified');
        }
      });
    });
  });
}


function sitemap() {
  console.log(`${timestamp.stamp()}: sitemap()`);
  COMPLETE.SITE_MAP = true;
  buildEvents.emit('sitemap-done');
}


function compressImages() {
  console.log(`${timestamp.stamp()}: compressImages()`);
  COMPLETE.IMAGE_COMPRESSION = true;
  buildEvents.emit('image-compression-done');
}


function gzip() {
  console.log(`${timestamp.stamp()}: gzip()`);
  COMPLETE.GZIP = true;
  buildEvents.emit('gzip-done');
}


function checkDone() {
  if (!COMPLETE.ASSET_HASH.DONE ||
      !COMPLETE.SITE_MAP ||
      !COMPLETE.IMAGE_COMPRESSION ||
      !COMPLETE.GZIP) {
    return false;
  }

  console.log(`COMPLETE.ASSET_HASH.DONE   : ${COMPLETE.ASSET_HASH.DONE}`);
  console.log(`COMPLETE.SITE_MAP          : ${COMPLETE.SITE_MAP}`);
  console.log(`COMPLETE.IMAGE_COMPRESSION : ${COMPLETE.IMAGE_COMPRESSION}`);
  console.log(`COMPLETE.GZIP              : ${COMPLETE.GZIP}`);

  require(`${dir.build}exit-message`)();

  process.exit();
}


// /////////////////////////////////////// event listeners ////////////////////////////////////////


if (devBuild) {
  b.on('update', (file) => {
    console.log(`${timestamp.stamp()}: File modified: JavaScript: ${file}`);
    bundleJS();
  });


  fs.watch(`${dir.src}styles/`, {
    recursive: true,
  }, (evt, file) => {
    console.log(`${timestamp.stamp()}: File modified: SCSS: ${file}`);
    bundleSCSS();
  });


  fs.watch(`${dir.src}templates/`, {
    recursive: true,
  }, (evt, file) => {
    console.log(`${timestamp.stamp()}: File modified: Template: ${file}`);
    bundleEJS();
  });


  fs.watch(`${dir.src}partials/`, {
    recursive: true,
  }, (evt, file) => {
    console.log(`${timestamp.stamp()}: File modified: Partial: ${file}`);
    bundleEJS();
  });


  fs.watch(`${dir.src}layout/`, {
    recursive: true,
  }, (evt, file) => {
    console.log(`${timestamp.stamp()}: File modified: Layout: ${file}`);
    bundleEJS();
  });


  fs.watch(`${dir.src}images/`, {
    recursive: true,
  }, (evt, file) => {
    console.log(`${timestamp.stamp()}: File modified: image: ${file}`);
    moveImages();
  });
} else {
  buildEvents.on('js-moved', minifyJS);
  buildEvents.on('styles-moved', assetHashing);
  buildEvents.on('js-minified', assetHashing);
  buildEvents.on('html-minified', assetHashing);
  buildEvents.on('images-moved', assetHashing);
  buildEvents.on('templates-moved', minifyHTML);
  buildEvents.on('templates-moved', sitemap);
  buildEvents.on('images-moved', compressImages);
  buildEvents.on('asset-hash-images-listed', updateCSSwithImageHashes);
  buildEvents.on('index-css-for-hashing', hashCSS);
  buildEvents.on('asset-hash-js-listed', finishHashing);
  buildEvents.on('asset-hash-css-listed', finishHashing);
  buildEvents.on('asset-hash-images-listed', finishHashing);
  buildEvents.on('hashing-done', gzip);


  buildEvents.on('hashing-done', checkDone);
  buildEvents.on('sitemap-done', checkDone);
  buildEvents.on('image-compression-done', checkDone);
  buildEvents.on('gzip-done', checkDone);
}


// ///////////////////////////////////////////// initializers ///////////////////////////////////////////////


const clean = new Promise((resolve, reject) => {
  console.log(`${timestamp.stamp()}: clean()`);

  const exec = require('child_process').exec;
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
  bundleJS();
  bundleSCSS();
  bundleEJS();
  moveImages();
});


if (devBuild) {
  app.use(serve(dir.package));

  const server = app.listen(3000, () => {
    console.log(`${timestamp.stamp()}: server is running at %s`, server.address().port);
  });
}


/*
  TODO:
    asset hashing
    sitemap
    rssfeed?
    minification
    gzip
*/
