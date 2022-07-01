const chokidar = require('chokidar');

const { log } = console;

const timestamp = require('./helpers/timestamp');
const BUILD_EVENTS = require('./constants/build-events');
const bundleJS = require('./bundlers/bundle-js');
const bundleSCSS = require('./bundlers/bundle-scss');
const compilePageMappingData = require('./page-mapping-data');
const optimizeSvgs = require('./optimize/optimize-svgs');
const { convertToWebp } = require('./optimize/convert-to-webp');

function watchForPreviewReady({ buildEvents, completionFlags }) {
  const eventsToWatch = {
    jsMoved: false,
    templatesMoved: false,
    stylesMoved: false,
    imagesMoved: false,
    svgsOptimized: false,
    faviconIcoMade: false,
  };

  function check() {
    if (Object.keys(eventsToWatch)
      .map((key) => eventsToWatch[key])
      .filter((value) => !value).length === 0) {
      completionFlags.PREVIEW_READY = true;
      buildEvents.emit(BUILD_EVENTS.previewReady);
    }
  }

  buildEvents.on(BUILD_EVENTS.jsMoved, () => {
    eventsToWatch.jsMoved = true;
    check();
  });
  buildEvents.on(BUILD_EVENTS.templatesMoved, () => {
    eventsToWatch.templatesMoved = true;
    check();
  });
  buildEvents.on(BUILD_EVENTS.stylesMoved, () => {
    eventsToWatch.stylesMoved = true;
    check();
  });
  buildEvents.on(BUILD_EVENTS.imagesMoved, () => {
    eventsToWatch.imagesMoved = true;
    check();
  });
  buildEvents.on(BUILD_EVENTS.faviconIcoMade, () => {
    eventsToWatch.faviconIcoMade = true;
    check();
  });
  buildEvents.on(BUILD_EVENTS.svgsOptimized, () => {
    eventsToWatch.svgsOptimized = true;
    check();
  });
}

module.exports = (configs) => {
  const { dir } = configs;

  watchForPreviewReady(configs);

  function update(path) {
    if (path.includes('.DS_Store')) return;
    log(`${timestamp.stamp()} ${`File modified: ${path.split('briananders.net')[1]}`.yellow}`);

    switch (true) {
      case path.includes('.DS_Store'):
        break;
      case path.includes(`${dir.src}js/`):
        bundleJS(configs);
        break;
      case path.includes(`${dir.src}styles/`):
        bundleSCSS(configs);
        break;
      case path.includes(`${dir.src}templates/`):
      case path.includes(`${dir.src}partials/`):
      case path.includes(`${dir.src}layout/`):
        compilePageMappingData(configs);
        break;
      case path.includes(`${dir.src}images/`) && /\.svg$/.test(path): // SVGs
        optimizeSvgs(configs);
        break;
      case path.includes(`${dir.src}images/`): // Other images
        convertToWebp(path, configs);
        break;
      default:
    }
  }

  function buildChanged(path) {
    if (path.includes('.DS_Store')) return;
    log(`${timestamp.stamp()} ${`Build file modified: ${path.split('briananders.net')[1]}`.bold.red}`);
    process.exit();
  }

  const buildDirWatcher = chokidar.watch(dir.build);
  const indexWatcher = chokidar.watch(`${dir.root}index.js`);
  const sourceWatcher = chokidar.watch(dir.src);

  buildDirWatcher.on('ready', () => {
    buildDirWatcher
      .on('change', buildChanged)
      .on('add', buildChanged)
      .on('unlink', buildChanged)
      .on('addDir', buildChanged)
      .on('unlinkDir', buildChanged);
  });

  indexWatcher.on('change', buildChanged);

  sourceWatcher.on('ready', () => {
    sourceWatcher
      .on('change', update)
      .on('add', update)
      .on('unlink', update)
      .on('addDir', update)
      .on('unlinkDir', update);
  });
};
