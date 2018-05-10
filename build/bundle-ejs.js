const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const mkdirp = require('mkdirp');
const merge = require('merge');
const ejs = require('ejs');
const matter = require('gray-matter');
const notifier = require('node-notifier');

module.exports = function bundleEJS(dir, completionFlags, buildEvents, pageMappingData) {
  const siteData = require(`${dir.build}site-data`)(dir);
  const timestamp = require(`${dir.build}timestamp`);
  const templateGlob = glob.sync(`${dir.src}templates/**/[^_]*.ejs`);
  const production = require(`${dir.build}production`);

  console.log(`${timestamp.stamp()}: bundleEJS()`);
  console.log(`${timestamp.stamp()}: compileEJSTemplates()`);

  let processed = 0;
  templateGlob.forEach((templatePath, index, array) => {
    console.log(`${timestamp.stamp()}: ${'REQUEST'.magenta} - Compiling Template - ${templatePath.split(/templates/)[1]}`);
    const ejsFunctions = require(`${dir.build}ejs-functions`)(dir, pageMappingData);
    const ejsOptions = {
      compileDebug: true,
      filename: templatePath,
      root: `${dir.src}templates/`,
    };
    const frontMatter = matter.read(templatePath);
    const templateData = merge({}, ejsFunctions, siteData, frontMatter.data);
    const outputPath = templatePath.replace(`${dir.src}templates/`, dir.package).replace(/\.ejs$/, (templatePath.includes('.html.ejs')) ? '' : '/index.html');

    fs.readFile(`${dir.src}layout/${templateData.layout}.ejs`, (error, data) => {
      if (error) throw error;

      const fileData = data.toString();
      let html;
      try {
        const renderedTemplate = ejs.render(frontMatter.content, templateData, ejsOptions);
        html = ejs.render(fileData, merge({ content: renderedTemplate }, templateData), ejsOptions);
      } catch (e) {
        console.error(e.message.red);
        notifier.notify({
          title: 'Template Error',
          message: e.message,
        });
        debugger;
        html = `
          <html>
            <head></head>
            <body>
              <h1>There was an error.</h1>
              <div style="color: red; font-family: monospace;">
                ${
                  e.message
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#039;")
                  .replace(/\n/g, '<br>')
                  .replace(/\s\s/g, '&nbsp;&nbsp;')
                }
              </div>
            </body>
          </html>`;
      }

      mkdirp(path.dirname(outputPath), (err) => {
        if (err) throw err;

        fs.writeFile(outputPath, html, (e) => {
          if (e) throw e;

          console.log(`${timestamp.stamp()}: ${'SUCCESS'.green} - Compiled Template - ${outputPath.split(/package/)[1]}`);
          processed++;

          if (processed >= array.length) {
            console.log(`${timestamp.stamp()}: ${'TEMPLATES DONE'.green.bold}`);
            buildEvents.emit('templates-moved');
          }
        });
      });
    });
  });
};
