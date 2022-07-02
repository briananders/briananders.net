const fs = require('fs-extra');
const copy = require('copy');
const glob = require('glob');
const path = require('path');
const pngToIco = require('png-to-ico');

const { log, error } = console;

function makeFaviconIco({
  dir, completionFlags, buildEvents, debug
}) {
  const timestamp = require(`${dir.build}helpers/timestamp`);
  const BUILD_EVENTS = require(`${dir.build}constants/build-events`);
  log(`${timestamp.stamp()} makeFaviconIco()`);
  completionFlags.FAVICON_ICO = false;
  pngToIco(`${dir.src}images/favicon_base.png`)
    .then((buffer) => {
      fs.writeFileSync(`${dir.package}favicon.ico`, buffer);
      log(`${timestamp.stamp()} makeFaviconIco(): ${'MOVED'.bold.green}`);
    })
    .catch(error);
}

function moveImages({ dir, completionFlags, buildEvents, debug }) {
  const timestamp = require(`${dir.build}helpers/timestamp`);
  const BUILD_EVENTS = require(`${dir.build}constants/build-events`);
  const { webpCandidates, images } = require(`${dir.build}constants/file-formats`);
  const { optimizeSvg } = require(`${dir.build}optimize/optimize-svgs`);
  const convertToWebp = require(`${dir.build}optimize/convert-to-webp`);

  function checkDone(processed, maximum) {
    if (processed >= maximum) {
      log(`${timestamp.stamp()} moveImages(): ${'DONE'.bold.green}`);
      completionFlags.IMAGES_ARE_MOVED = true;
      buildEvents.emit(BUILD_EVENTS.imagesMoved);
    }
  }

  fs.removeSync(`${dir.package}images/`);

  fs.mkdirpSync(`${dir.package}images/`);

  makeFaviconIco({ dir, completionFlags, buildEvents });

  const imagesGlob = glob.sync(`${dir.src}images/**/*.{${images.join(',')}}`);
  let processed = 0;

  for (let i = 0; i < imagesGlob.length; i++) {
    const imagePath = imagesGlob[i];
    const extn = path.extname(imagePath);
    const destination = imagePath.replace(dir.src, dir.package);

    fs.mkdirpSync(path.dirname(destination));

    if (extn === '.svg') {
      // move optimized svg
      optimizeSvg(imagePath, { dir });
      processed++;
      if (debug) log(`${processed}/${imagesGlob.length}: ${imagePath}`);
      checkDone(processed, imagesGlob.length);
    } else if (webpCandidates.includes(extn.substring(1))) {
      // move file and move webp file
      convertToWebp(imagePath, { dir }).then(() => {
        fs.copyFile(imagePath, destination);
        processed++;
        if (debug) log(`${processed}/${imagesGlob.length}: ${imagePath}`);
        checkDone(processed, imagesGlob.length);
      });
    } else {
      // move file
      fs.copyFile(imagePath, destination);
      processed++;
      if (debug) log(`${processed}/${imagesGlob.length}: ${imagePath}`);
      checkDone(processed, imagesGlob.length);
    }
  }
}

module.exports = ({ dir, completionFlags, buildEvents, debug }) => {
  completionFlags.IMAGES_ARE_MOVED = false;
  completionFlags.VIDEOS_ARE_MOVED = false;

  const BUILD_EVENTS = require(`${dir.build}constants/build-events`);
  const timestamp = require(`${dir.build}helpers/timestamp`);

  log(`${timestamp.stamp()} moveImages()`);
  log(`${timestamp.stamp()} moveVideos()`);
  log(`${timestamp.stamp()} moveTxt()`);

  moveImages({ dir, completionFlags, buildEvents, debug });

  fs.removeSync(`${dir.package}videos/`);
  // move videos over
  fs.copy(`${dir.src}videos/`, `${dir.package}videos/`, (err) => {
    if (err) throw err;
    log(`${timestamp.stamp()} moveVideos(): ${'DONE'.bold.green}`);
    completionFlags.VIDEOS_ARE_MOVED = true;
    buildEvents.emit(BUILD_EVENTS.videosMoved);
  });

  // move humans and robots text files
  copy(`${dir.src}*.txt`, dir.package, (err) => {
    if (err) throw err;
    log(`${timestamp.stamp()} moveTxt(): ${'DONE'.bold.green}`);
  });
};
