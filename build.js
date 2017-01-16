#!/usr/bin/env node

/*
Metalsmith build file
Build site with `node ./build.js` or `npm start`
Build production site with `npm run production`
*/

'use strict';

var
// defaults
  // consoleLog = false, // set true for metalsmith file and meta content logging
  devBuild = ((process.env.NODE_ENV || '').trim().toLowerCase() !== 'production'),
  pkg = require('./package.json'),

  // main directories
  dir = {
    base: __dirname + '/',
    lib: __dirname + '/lib/',
    source: './src/',
    dest: './build/'
  },

  // modules
  Metalsmith = require('metalsmith'),
  markdown = require('metalsmith-markdown'),
  publish = require('metalsmith-publish'),
  collections = require('metalsmith-collections'),
  permalinks = require('metalsmith-permalinks'),
  inplace = require('metalsmith-in-place'),
  layouts = require('metalsmith-layouts'),
  sitemap = require('metalsmith-mapsite'),
  rssfeed = require('metalsmith-feed'),
  assets = require('metalsmith-assets'),
  htmlmin = devBuild ? null : require('metalsmith-html-minifier'),
  browsersync = devBuild ? require('metalsmith-browser-sync') : null,
  sass = require('metalsmith-sass'),
  browserify = require('metalsmith-browserify'),
  compress = require('metalsmith-gzip'),
  watch = require('metalsmith-watch'),
  path = require('metalsmith-path'),
  copy = require('metalsmith-static'),

  // custom plugins
  setdate = require(dir.lib + 'metalsmith-setdate'),
  moremeta = require(dir.lib + 'metalsmith-moremeta'),

  siteMeta = {
    devBuild: devBuild,
    version: pkg.version,
    name: 'Brian Anders, Engineer',
    desc: "Hi, I'm Brian. My story is pretty simple. I grew up in rural Iowa. Then I moved to California to work for Nest. That's pretty much it.",
    author: 'Brian Anders',
    contact: 'http://www.last.fm/user/iBrianAnders',
    domain: 'http://briananders.net/', // set domain
    rootpath: devBuild ? null : '/' // set absolute path (null for relative)
  },

  templateConfig = {
    engine: 'handlebars',
    directory: dir.source + 'template/',
    partials: dir.source + 'partials/',
    default: 'page.html'
  };

console.log((devBuild ? 'Development' : 'Production'), 'build, version', pkg.version);

var ms = new Metalsmith(dir.base)
  .clean(true) // clean folder
  .source(dir.source + 'html/') // source folder (src/html/)
  .destination(dir.dest) // build folder (build/)
  .metadata(siteMeta) // add meta data to every page
  .use(publish()) // draft, private, future-dated
  .use(setdate()) // set date on every page if not set in front-matter
  .use(collections({ // determine page collection/taxonomy
    page: {
      pattern: '**/index.*',
      sortBy: 'priority',
      reverse: true,
      refer: false
    },
    thoughts: {
      pattern: 'thoughts/**/*',
      sortBy: 'date',
      reverse: true,
      refer: true,
      metadata: {
        layout: 'page.html'
      }
    },
    experience: {
      pattern: 'experience/**/*',
      sortBy: 'date',
      reverse: true,
      refer: true,
      metadata: {
        layout: 'page.html'
      }
    }
  }))
  .use(path({
    baseDirectory : "/"
  }))
  .use(markdown()) // convert markdown
  .use(permalinks({ // generate permalinks
    pattern: ':mainCollection/:title'
  }))
  .use(moremeta()) // determine root paths and navigation
  .use(inplace(templateConfig)) // in-page templating
  .use(layouts(templateConfig)) // layout templating
  // first argument is the destination
  // other arguments get passed to browserify
  .use(browserify('js/anders.js', [
    dir.source + 'assets/js/main.js'
  ]))
  // .use(assets({ // copy assets: CSS, images etc.
  //   source: dir.source + 'assets/images/',
  //   destination: "./images/"
  // }))
  .use(assets({ // copy assets: CSS, images etc.
    source: dir.source + 'assets/styles/',
    destination: "./styles/"
  }))
  .use(sass({
    includePaths: [dir.source + 'assets/styles/'],
    sourceMap: true,
    outputDir: 'styles/'
  }))
  .use(copy({
    src: "public",
    dest: "."
  }))
  .use(copy({
    src: "ember-app/dist/assets",
    dest: "ember-app"
  }))
  ;

if(devBuild) {
  ms.use(
    watch({
      paths: {
        "./public/**/*": true,
        "./ember-app/dist/assets/*": true
      }
    })
  );
}

if (htmlmin) ms.use(htmlmin()); // minify production HTML

if (browsersync) ms.use(browsersync({ // start test server
  server: dir.dest,
  files: [dir.source + '**/*']
}));

ms
  .use(sitemap({ // generate sitemap.xml
    hostname: siteMeta.domain + (siteMeta.rootpath || ''),
    omitIndex: true,
    'X-Robots-Tag': 'noindex'
  }))
  .use(rssfeed({ // generate RSS feed for articles
    collection: 'thoughts',
    site_url: siteMeta.domain + (siteMeta.rootpath || ''),
    title: siteMeta.name,
    description: siteMeta.desc
  }))
  .use(compress())
  .build(function(err) { // build
    if (err) throw err;
  });