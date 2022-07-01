const { log } = console;
const glob = require('glob');
const { optimize } = require('svgo');
const { readFileSync, writeFile } = require('fs-extra');

const BUILD_EVENTS = require('../constants/build-events');

module.exports = function optimizeSvgs({
  dir, completionFlags, debug, buildEvents,
}) {
  completionFlags.SVG_OPTIMIZATION = false;
  let processed = 0;
  const timestamp = require(`${dir.build}helpers/timestamp`);

  log(`${timestamp.stamp()} optimizeSvgs()`);
  const svgGlob = glob.sync(`${dir.src}images/**/*.svg`);

  svgGlob.forEach((path, index, array) => {
    const svgString = readFileSync(path);

    const { data } = optimize(svgString, {
      path,
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false,
              cleanupIDs: false,
              removeDoctype: false,
            },
          },
        }
      ],
    });

    writeFile(path, data, (e) => {
      if (e) throw e;
      if (debug) log(`${timestamp.stamp()} ${'SUCCESS'.bold.green} - Compressed SVG - ${path.split(/images/)[1]}`);
      processed++;

      if (processed === array.length) {
        log(`${timestamp.stamp()} optimizeSvgs(): ${'DONE'.bold.green}`);
        completionFlags.SVG_OPTIMIZATION = true;
        buildEvents.emit(BUILD_EVENTS.svgsOptimized);
      }
    });
  });
};
