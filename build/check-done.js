module.exports = function checkDone({ dir, completionFlags }) {
  const timestamp = require(`${dir.build}timestamp`);

  if (!completionFlags.ASSET_HASH.DONE ||
      !completionFlags.SITE_MAP ||
      !completionFlags.IMAGE_COMPRESSION ||
      !completionFlags.GZIP) {
    return false;
  }

  console.log(`${timestamp.stamp()}: completionFlags.ASSET_HASH.DONE   : ${completionFlags.ASSET_HASH.DONE}`);
  console.log(`${timestamp.stamp()}: completionFlags.SITE_MAP          : ${completionFlags.SITE_MAP}`);
  console.log(`${timestamp.stamp()}: completionFlags.IMAGE_COMPRESSION : ${completionFlags.IMAGE_COMPRESSION}`);
  console.log(`${timestamp.stamp()}: completionFlags.GZIP              : ${completionFlags.GZIP}`);

  require(`${dir.build}exit-message`)();

  process.exit();
};
