'use strict';

const dir = {
  src: `${__dirname}/src/`,
  package: `${__dirname}/package/`,
  build: `${__dirname}/build/`,
};

require('colors');

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


// /////////////////////////////// compile tasks /////////////////////////////////


function bundleSCSS() {
  console.log(`${timestamp.stamp()}: bundleSCSS()`);
  const stylesGlob = glob.sync(`${dir.src}styles/**/[^_]*.scss`);
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
    buildEvents.emit('images-moved');
  });

  // move humans and robots text files
  copy(`${dir.src}*.txt`, `${dir.package}`, (err) => {
    if (err) throw err;
    console.log(`${timestamp.stamp()}: ${'SUCCESS'.green} - moved .txt files`);
  });
}


function assetHashing() {
  console.log(`${timestamp.stamp()}: assetHashing()`);
}


function sitemap() {
  console.log(`${timestamp.stamp()}: sitemap()`);
}


function minifyJS() {
  console.log(`${timestamp.stamp()}: minifyJS()`);

  const jsGlob = glob.sync(`${dir.package}scripts/*.js`);
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
          buildEvents.emit('html-minified');
        }
      });
    });
  });
}


function compressImages() {
  console.log(`${timestamp.stamp()}: compressImages()`);
}


function gzip() {
  console.log(`${timestamp.stamp()}: gzip()`);
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
  buildEvents.on('', sitemap);
  buildEvents.on('templates-moved', minifyHTML);
  buildEvents.on('', compressImages);
  buildEvents.on('', gzip);
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
