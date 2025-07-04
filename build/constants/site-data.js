module.exports = (dir) => {
  const pkg = require(`${dir.root}package.json`);
  const production = require(`${dir.build}helpers/production`);

  const handles = {
    instagram: 'imbanders',
    mastodon: 'banders',
    twitter: 'imbanders',
    drumYoutube: 'bandersdrums',
    lastfm: 'imbanders',
    bluesky: 'imbanders.bsky.social',
    github: 'briananders',
    linkedin: 'andersbrian',
  };

  const URLs = {
    instagram: `https://instagram.com/${handles.instagram}`,
    mastodon: `https://mastodon.social/@${handles.mastodon}`,
    twitter: `https://twitter.com/${handles.twitter}`,
    drumYoutube: `https://www.youtube.com/@${handles.drumYoutube}`,
    lastfm: `https://www.last.fm/user/${handles.lastfm}`,
    bluesky: `https://bsky.app/profile/${handles.bluesky}`,
    github: `https://github.com/${handles.github}`,
    linkedin: `https://www.linkedin.com/in/${handles.linkedin}`,
    batLessons: 'https://batlessons.com',
    bandersDrums: '/drums',
  };


  return {
    devBuild: !production,
    version: pkg.version,
    name: 'Brian Anders',
    description: "Brian Anders is an Engineer Manager in the tech industry. Also a youtuber, podcaster, and musician. He's just an average guy.",
    contact: URLs.twitter,
    domain: 'https://briananders.net/', // set domain
    URLs,
    handles,
  };
};
