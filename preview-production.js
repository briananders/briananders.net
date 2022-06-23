'use strict';

require('colors');

const dir = {
  root: `${__dirname}/`,
  src: `${__dirname}/src/`,
  package: `${__dirname}/package/`,
  build: `${__dirname}/build/`,
  jsOutputPath: `${__dirname}/package/scripts/`,
};

const timestamp = require(`${dir.build}timestamp`);
const express = require('express');
const serve = require('express-static');
const app = express();

// /////////////////////////////////////// event listeners ////////////////////////////////////////

app.use(serve(dir.package));

const server = app.listen(3000, () => {
  console.log(`${timestamp.stamp()}: server is running at http://localhost:%s`, server.address().port);
});
