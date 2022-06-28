const webp = require('webp-converter');
const glob = require('glob');
const { log } = console;

const BUILD_EVENTS = require('./constants/build-events');

function done({ dir, completionFlags, buildEvents }) {
  const timestamp = require(`${dir.build}timestamp`);
  log(`${timestamp.stamp()} convertToWebp(): ${'DONE'.bold.green}`);
  completionFlags.IMAGES_TO_WEBP = true;
  buildEvents.emit(BUILD_EVENTS.imagesConverted);
}

function convertToWebp(sourceImage, { dir, completionFlags, debug, buildEvents }) {
}) {
  webp.grant_permission();
  completionFlags.IMAGES_TO_WEBP = false;
  const timestamp = require(`${dir.build}timestamp`);

  const webpImage = sourceImage.substring(0, sourceImage.lastIndexOf('.'));
  const result = webp.cwebp(sourceImage, `${webpImage}.webp`);
  result.then(done.bind(this, { dir, completionFlags, debug, buildEvents }));
}

function convertAllToWebp({ dir, completionFlags, debug, buildEvents }) {
  webp.grant_permission();

  completionFlags.IMAGES_TO_WEBP = false;
  let processed = 0;
  const timestamp = require(`${dir.build}timestamp`);

  const imagesGlob = [...glob.sync(`${dir.src}images/**/*.jpg`), ...glob.sync(`${dir.src}images/**/*.png`)];

  imagesGlob.forEach((sourceImage) => {
    const webpImage = sourceImage.substring(0, sourceImage.lastIndexOf('.'));
    const result = webp.cwebp(sourceImage, `${webpImage}.webp`);
    result.then(() => {
      processed++;
      if (debug) log(`Webm processed: ${processed} / ${imagesGlob.length}`);
      if (processed >= imagesGlob.length) {
        done({ dir, completionFlags, debug, buildEvents });
      }
    });
  });
};


module.exports = {
  convertAllToWebp,
  convertToWebp,
};
