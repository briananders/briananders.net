const ejs = require('ejs');
const fs = require('fs-extra');

const BUILD_EVENTS = require('./constants/build-events');

const { log } = console;

module.exports = function sitemap({
  dir, completionFlags, buildEvents, pageMappingData,
}) {
  completionFlags.SITE_MAP = false;

  const timestamp = require(`${dir.build}timestamp`);
  const siteData = require(`${dir.build}site-data`)(dir);

  log(`${timestamp.stamp()} sitemap()`);
  ejs.renderFile(`${dir.src}sitemap.xml.ejs`, {
    pages: pageMappingData,
    siteData,
  }, {
    compileDebug: true,
  }, (error, str) => {
    if (error) throw error;
    fs.writeFile(`${dir.package}sitemap.xml`, str, (err) => {
      if (err) throw err;

      completionFlags.SITE_MAP = true;
      log(`${timestamp.stamp()} sitemap(): ${'DONE'.bold.green}`);
      buildEvents.emit(BUILD_EVENTS.sitemapDone);
    });
  });
};
