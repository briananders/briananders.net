const ejs = require('ejs');
const fs = require('fs-extra');

const { log } = console;

module.exports = function sitemap({
  dir, completionFlags, buildEvents, pageMappingData,
}) {
  completionFlags.SITE_MAP = false;
  let doneCount = 0;

  const BUILD_EVENTS = require(`${dir.build}constants/build-events`);
  const timestamp = require(`${dir.build}helpers/timestamp`);
  const siteData = require(`${dir.build}constants/site-data`)(dir);

  function checkForDone() {
    if (doneCount >= 2) {
      log(`${timestamp.stamp()} sitemap(): ${'DONE'.bold.green}`);
      completionFlags.SITE_MAP = true;
      buildEvents.emit(BUILD_EVENTS.sitemapDone);
    }
  }

  log(`${timestamp.stamp()} sitemap()`);
  ejs.renderFile(`${dir.src}sitemap.json.ejs`, {
    pages: pageMappingData,
    siteData,
  }, {
    compileDebug: true,
  }, (error, str) => {
    if (error) throw error;
    fs.writeFile(`${dir.package}sitemap.json`, str, (err) => {
      if (err) throw err;

      doneCount++;
      checkForDone();
    });
  });

  ejs.renderFile(`${dir.src}sitemap.xml.ejs`, {
    pages: pageMappingData,
    siteData,
  }, {
    compileDebug: true,
  }, (error, str) => {
    if (error) throw error;
    fs.writeFile(`${dir.package}sitemap.xml`, str, (err) => {
      if (err) throw err;

      doneCount++;
      checkForDone();
    });
  });
};
