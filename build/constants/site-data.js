module.exports = (dir) => {
  const pkg = require(`${dir.root}package.json`);
  const production = require(`${dir.build}helpers/production`);

  const instagramHandle = 'imbanders';
  const instagram = `https://instagram.com/${instagramHandle}`;
  const mastodonHandle = 'banders';
  const mastodon = `https://mastodon.social/@${mastodonHandle}`;
  const twitterHandle = 'imbanders';
  const twitter = `https://twitter.com/${twitterHandle}`;
  const cdYTHandle = 'bandersdrums';
  const cdYT = `https://www.youtube.com/@${cdYTHandle}`;

  return {
    devBuild: !production,
    version: pkg.version,
    name: 'Brian Anders',
    description: "Brian Anders is an Engineer Manager in the tech industry. I'm also a Youtuber, Podcaster, and Musician.",
    author: 'Brian Anders',
    contact: twitter,
    domain: 'https://briananders.net/', // set domain
    instagram,
    instagramHandle,
    lastfm: 'https://www.last.fm/user/imbanders',
    bluesky: 'https://bsky.app/profile/imbanders.bsky.social',
    twitterHandle,
    twitter,
    github: 'https://github.com/briananders',
    linkedin: 'https://www.linkedin.com/in/andersbrian/',
    mastodonHandle,
    mastodon,
    bandersDrums: {
      youtubeHandle: cdYTHandle,
      youtube: cdYT,
      path: '/drums',
    },
    batLessons: 'https://batlessons.com',
  };
};
