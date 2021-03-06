module.exports = function compressImages({ dir, completionFlags, buildEvents }) {
  const timestamp = require(`${dir.build}timestamp`);

  console.log(`${timestamp.stamp()}: TODO compressImages()`);
  completionFlags.IMAGE_COMPRESSION = true;
  buildEvents.emit('image-compression-done');
};
