const fs = require('fs-extra');
const copy = require('copy');

module.exports = function moveImages({ dir, completionFlags, buildEvents }) {
  completionFlags.IMAGES_ARE_MOVED = false;

  const timestamp = require(`${dir.build}timestamp`);

  // move images over
  fs.copy(`${dir.src}images/`, `${dir.package}images/`, (err) => {
    if (err) throw err;
    console.log(`${timestamp.stamp()}: ${'SUCCESS'.green} - moved images`);
    completionFlags.IMAGES_ARE_MOVED = true;
    buildEvents.emit('images-moved');
  });

  // move humans and robots text files
  copy(`${dir.src}*.txt`, `${dir.package}`, (err) => {
    if (err) throw err;
    console.log(`${timestamp.stamp()}: ${'SUCCESS'.green} - moved .txt files`);
  });
};
