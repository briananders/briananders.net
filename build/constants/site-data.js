module.exports = (dir) => {
  const pkg = require(`${dir.root}package.json`);
  const production = require(`${dir.build}helpers/production`);

  const instagramHandle = 'imbanders';
  const instagram = `https://instagram.com/${instagramHandle}`;
  const mastodonHandle = 'banders';
  const mastodon = `https://mastodon.social/@${mastodonHandle}`;
  const twitterHandle = 'imbanders';
  const twitter = `https://twitter.com/${twitterHandle}`;
  const cdYTHandle = 'coyote_drums';
  const cdYT = `https://www.youtube.com/@${cdYTHandle}`;

  return {
    devBuild: !production,
    version: pkg.version,
    name: 'Brian Anders',
    description: "Hi, I'm Brian. Iowa is my home. Graceland University is my alma mater. Now, I live in California and work for Google. That’s pretty much it.",
    author: 'Brian Anders',
    contact: twitter,
    domain: 'https://briananders.net/', // set domain
    instagram,
    instagramHandle,
    lastfm: 'https://www.last.fm/user/iBrianAnders',
    twitterHandle,
    twitter,
    github: 'https://github.com/briananders',
    linkedin: 'https://www.linkedin.com/in/andersbrian/',
    mastodonHandle,
    mastodon,
    coyoteDrums: {
      youtubeHandle: cdYTHandle,
      youtube: cdYT,
      path: '/drums',
    },
    batLessons: 'https://batlessons.com',
  };
};
