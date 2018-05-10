const notifier = require('node-notifier');
const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require('babelify');
const buffer = require('vinyl-buffer');
const gulp = require('gulp');
const rename = require('gulp-rename');
const source = require('vinyl-source-stream');


module.exports = function bundleJS(dir, completionFlags, buildEvents) {
  const timestamp = require(`${dir.build}timestamp`);
  const production = require(`${dir.build}production`);

  const config = {
    js: {
      src: `${dir.src}js/main.js`,  // Entry point
      outputDir: dir.jsOutputPath,  // Directory to save bundle to
      outputFile: 'main.js',        // Name to use for bundle
    },
  };

  console.log(`${timestamp.stamp()}: bundleJS()`);
  // console.log(`${timestamp.stamp()}: File modified: JavaScript: ${file}`);

  // This method makes it easy to use common bundling options in different tasks
  function bundle(bundler) {
    // Add options to add to "base" bundler passed as parameter
    bundler
      .transform(babelify, { presets: ['env', 'react'] })
      .bundle()                               // Start bundle
      .on('error', (error) => {
        if (production) throw error;
        else {
          console.error(error.message.red);
          notifier.notify({
            title: 'JavaScript Error',
            message: error.message,
          });
        }
      })
      .pipe(source(config.js.src))            // Entry point
      .pipe(buffer())                         // Convert to gulp pipeline
      .pipe(rename(config.js.outputFile))     // Rename output from 'main.js' to 'bundle.js'
      .pipe(gulp.dest(config.js.outputDir))  // Save 'bundle' to build/
      .on('end', () => {
        console.log(`${timestamp.stamp()}: ${'JAVASCRIPT BROWSERIFIED'.green.bold}`);
        console.log(`${timestamp.stamp()}: ${'SUCCESS'.green} - Compiled JS`);
        buildEvents.emit('js-moved');
      });
  }

  const opts = {
    entries: [config.js.src],
    debug: true,
    plugin: [watchify],
    cache: {}, // required for watchify
    packageCache: {}, // required for watchify
  };

  const bundler = browserify(opts);  // Pass browserify the entry point

  bundle(bundler);  // Chain other options -- sourcemaps, rename, etc.
};
