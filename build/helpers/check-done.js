module.exports = function checkDone({ dir, debug, completionFlags }) {
  const timestamp = require(`${dir.build}helpers/timestamp`);

  const { log } = console;

  if (!completionFlags.ASSET_HASH.DONE
      || !completionFlags.SITE_MAP
      || !completionFlags.GZIP) {
    if (debug) {
      log(`${timestamp.stamp()} completionFlags.ASSET_HASH.DONE   : ${completionFlags.ASSET_HASH.DONE.toString().bold.green}`);
      log(`${timestamp.stamp()} completionFlags.SITE_MAP          : ${completionFlags.SITE_MAP.toString().bold.green}`);
      log(`${timestamp.stamp()} completionFlags.GZIP              : ${completionFlags.GZIP.toString().bold.green}`);
    }
    return false;
  }

  log(`${timestamp.stamp()} completionFlags.ASSET_HASH.DONE   : ${completionFlags.ASSET_HASH.DONE.toString().bold.green}`);
  log(`${timestamp.stamp()} completionFlags.SITE_MAP          : ${completionFlags.SITE_MAP.toString().bold.green}`);
  log(`${timestamp.stamp()} completionFlags.GZIP              : ${completionFlags.GZIP.toString().bold.green}`);

  require(`${dir.build}helpers/exit-message`)();

  process.exit();
};
