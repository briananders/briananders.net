const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const mkdirp = require('mkdirp');
const merge = require('merge');
const ejs = require('ejs');
const matter = require('gray-matter');

module.exports = function bundleEJS(dir, completionFlags, buildEvents, pageMappingData) {
  const ejsFunctions = require(`${dir.build}ejs-functions`);
  const siteData = require(`${dir.build}site-data`)(dir);
  const timestamp = require(`${dir.build}timestamp`);

  console.log(`${timestamp.stamp()}: bundleEJS()`);
  const templateGlob = glob.sync(`${dir.src}templates/**/[^_]*.ejs`);
  let processed = 0;
  templateGlob.forEach((templatePath, index, array) => {
    console.log(`${timestamp.stamp()}: ${'REQUEST'.magenta} - Compiling Template - ${templatePath.split(/templates/)[1]}`);

    const outputPath = templatePath.replace(`${dir.src}templates/`, dir.package).replace(/\.ejs$/, (templatePath.includes('.html.ejs')) ? '' : '/index.html');
    const frontMatter = matter.read(templatePath);

    pageMappingData.push({
      url: outputPath.replace(dir.package, '').replace('index.html', ''),
      data: frontMatter.data,
    });

    const pageData = merge({ content: frontMatter.content }, ejsFunctions, siteData, frontMatter.data);

    const base = fs.readFileSync(`${dir.src}layout/${pageData.layout}.ejs`).toString();

    const html = ejs.render(base, pageData, {
      compileDebug: true,
      filename: templatePath,
      root: `${dir.src}templates/`,
    });

    mkdirp(path.dirname(outputPath), (error) => {
      if (error) throw error;
      fs.writeFile(outputPath, html);
      console.log(`${timestamp.stamp()}: ${'SUCCESS'.green} - Compiled Template - ${outputPath.split(/package/)[1]}`);
      processed++;

      if (processed === array.length) {
        console.log(`${timestamp.stamp()}: ${'TEMPLATES DONE'.green.bold}`);
        buildEvents.emit('templates-moved');
      }
    });
  });
};
