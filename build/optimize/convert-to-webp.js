const webp = require('webp-converter');
const glob = require('glob');
const path = require('path');
const { existsSync } = require('fs-extra');
const { log } = console;

function done({ dir, completionFlags, buildEvents }) {
  const BUILD_EVENTS = require(`${dir.build}constants/build-events`);
  const timestamp = require(`${dir.build}helpers/timestamp`);
  log(`${timestamp.stamp()} convertToWebp(): ${'DONE'.bold.green}`);
  completionFlags.IMAGES_TO_WEBP = true;
  buildEvents.emit(BUILD_EVENTS.imagesConverted);
}

function convertToWebp(sourceImage, {
  dir, completionFlags, debug, buildEvents,
}) {
  const timestamp = require(`${dir.build}helpers/timestamp`);
  const extn = path.extname(sourceImage);

  if (!existsSync(sourceImage)) {
    log(`${timestamp.stamp()} convertToWebp(): ${'CANCELLED'.bold.yellow} not conversion candidates`);
    return;
  } if (!['.jpg', '.png'].includes(extn)) {
    log(`${timestamp.stamp()} convertToWebp(): ${'CANCELLED'.bold.yellow} not conversion candidates`);
    return;
  }

  webp.grant_permission();
  completionFlags.IMAGES_TO_WEBP = false;

  log(`${timestamp.stamp()} convertToWebp()`);

  const webpImage = sourceImage.substring(0, sourceImage.lastIndexOf('.'));
  const result = webp.cwebp(sourceImage, `${webpImage}.webp`);
  result.then(done.bind(this, {
    dir, completionFlags, debug, buildEvents,
  }));
}

function convertAllToWebp({
  dir, completionFlags, debug, buildEvents,
}) {
  webp.grant_permission();

  completionFlags.IMAGES_TO_WEBP = false;
  let processed = 0;
  const timestamp = require(`${dir.build}helpers/timestamp`);

  log(`${timestamp.stamp()} convertToWebp()`);

  const imagesGlob = [...glob.sync(`${dir.src}images/**/*.jpg`), ...glob.sync(`${dir.src}images/**/*.png`)];

  imagesGlob.forEach((sourceImage) => {
    const webpImage = sourceImage.substring(0, sourceImage.lastIndexOf('.'));
    const result = webp.cwebp(sourceImage, `${webpImage}.webp`);
    result.then(() => {
      processed++;
      if (debug) log(`Webm processed: ${processed} / ${imagesGlob.length}`);
      if (processed >= imagesGlob.length) {
        done({
          dir, completionFlags, debug, buildEvents,
        });
      }
    });
  });
}

module.exports = {
  convertAllToWebp,
  convertToWebp,
};
