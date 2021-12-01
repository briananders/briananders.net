const { log } = console;

const BUILD_EVENTS = require(`./constants/build-events`);

module.exports = function compressImages({ dir, completionFlags, buildEvents }) {
  const timestamp = require(`${dir.build}timestamp`);

  log(`${timestamp.stamp()} ${'TODO'.red.bold} compressImages()`);
  completionFlags.IMAGE_COMPRESSION = true;
  buildEvents.emit(BUILD_EVENTS.imageCompressionDone);
};
