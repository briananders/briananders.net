const fs = require('fs-extra');
const glob = require('glob');
const htmlMinify = require('html-minifier');

module.exports = function minifyHTML({ dir, completionFlags, buildEvents, debug }) {
  completionFlags.HTML_IS_MINIFIED = false;

  const timestamp = require(`${dir.build}timestamp`);

  console.log(`${timestamp.stamp()}: minifyHTML()`);

  const htmlGlob = glob.sync(`${dir.package}**/*.html`);
  let processed = 0;

  htmlGlob.forEach((htmlFileName, index, array) => {
    if (debug) console.log(`${timestamp.stamp()}: minifyHTML - ${htmlFileName.split('/package/')[1]}`);

    fs.readFile(htmlFileName, (error, data) => {
      if (error) throw error;

      const minifiedHtml = htmlMinify.minify(data.toString(), {
        caseSensitive: true,
        collapseWhitespace: false,
        conservativeCollapse: true,
        html5: true,
        keepClosingSlash: true,
        minifyCSS: true,
        minifyJS: true,
        removeAttributeQuotes: true,
        removeComments: true,
        sortClassName: true,
        useShortDoctype: true,
      });

      fs.writeFile(htmlFileName, minifiedHtml, (err) => {
        if (err) throw err;
        processed++;

        if (processed === array.length) {
          console.log(`${timestamp.stamp()}: ${'minifyHTML completionFlags'.bold.green}`);
          completionFlags.HTML_IS_MINIFIED = true;
          buildEvents.emit('html-minified');
        }
      });
    });
  });
};
