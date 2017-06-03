module.exports = (dir) => {
  const pkg = require(`${dir.root}package.json`);
  const production = require(`${dir.build}production`);

  return {
    devBuild: !production,
    version: pkg.version,
    name: 'Brian Anders, Engineer',
    description: "Hi, I'm Brian. My story is pretty simple. I grew up in rural Iowa. Then I moved to California to work for Nest. That's pretty much it.",
    author: 'Brian Anders',
    contact: 'http://www.last.fm/user/iBrianAnders',
    domain: 'http://briananders.net/', // set domain
  };
};
