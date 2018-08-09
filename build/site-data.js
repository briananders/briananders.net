module.exports = (dir) => {
  const pkg = require(`${dir.root}package.json`);
  const production = require(`${dir.build}production`);

  return {
    devBuild: !production,
    version: pkg.version,
    name: 'Brian Anders',
    description: "Hi, I'm Brian. Iowa is my home. Graceland University is my alma mater. Now, I live in California and work for Nest. That's pretty much it.",
    author: 'Brian Anders',
    contact: 'https://www.last.fm/user/iBrianAnders',
    domain: 'https://briananders.net/', // set domain
  };
};
