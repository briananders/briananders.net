const webp = require('webp-converter');
const path = require('path');
const { log } = console;

function convertToWebp(sourceImage, { dir }) {
  const timestamp = require(`${dir.build}helpers/timestamp`);
  const extn = path.extname(sourceImage);

  const { webpCandidates } = require(`${dir.build}constants/file-formats`);

  if (!webpCandidates.includes(extn.substring(1))) {
    log(`${timestamp.stamp()} convertToWebp(): ${'CANCELLED'.bold.yellow} not conversion candidates`);
    return;
  }

  webp.grant_permission();

  const destinationFileName = sourceImage.replace(dir.src, dir.package);
  const result = webp.cwebp(sourceImage, `${destinationFileName.substring(0, destinationFileName.lastIndexOf('.'))}.webp`);

  return result;
}

module.exports = convertToWebp;
