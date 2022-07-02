const { log } = console;
const glob = require('glob');
const path = require('path');
const { optimize } = require('svgo');
const { readFileSync, writeFile, mkdirpSync } = require('fs-extra');

const plugins = [
  {
    name: 'preset-default',
    params: {
      overrides: {
        removeViewBox: false,
        cleanupIDs: false,
        removeDoctype: false,
      },
    },
  }
];

function getSVG(path) {

  const svgString = readFileSync(path);

  const { data } = optimize(svgString, {
    path,
    plugins,
  });

  return data;
};

function optimizeSvg(filePath, { dir }) {
  const svgString = readFileSync(filePath);
  const destination = filePath.replace(dir.src, dir.package);

  const { data } = optimize(svgString, {
    path: filePath,
    plugins,
  });

  mkdirpSync(path.dirname(destination));

  writeFile(destination, data, (e) => {
    if (e) throw e;
  });
};


module.exports = {
  getSVG,
  optimizeSvg,
}
