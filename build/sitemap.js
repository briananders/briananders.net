const ejs = require('ejs');
const fs = require('fs-extra');

module.exports = function sitemap(dir, completionFlags, buildEvents, pageMappingData) {
  const timestamp = require(`${dir.build}timestamp`);
  const siteData = require(`${dir.build}site-data`)(dir);

  console.log(`${timestamp.stamp()}: sitemap()`);
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
      buildEvents.emit('sitemap-done');
    });
  });
};
