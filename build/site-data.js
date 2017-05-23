const pkg = require(`${__dirname}/../package.json`);

module.exports = {
  devBuild: ((process.env.NODE_ENV || '').trim().toLowerCase() !== 'production'),
  version: pkg.version,
  name: 'Brian Anders, Engineer',
  desc: "Hi, I'm Brian. My story is pretty simple. I grew up in rural Iowa. Then I moved to California to work for Nest. That's pretty much it.",
  author: 'Brian Anders',
  contact: 'http://www.last.fm/user/iBrianAnders',
  domain: 'http://briananders.net/', // set domain
}