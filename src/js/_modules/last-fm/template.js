module.exports = {
  album: `{{#each items}}<album-listing name="{{name}}" artist="{{artist.name}}" count="{{playcount}}" max="{{max}}" img="{{imageSrc}}">{{name}}</album-listing>{{/each}}`,
  artist: `{{#each items}}<artist-listing name="{{name}}" count="{{playcount}}" max="{{max}}">{{name}}</artist-listing>{{/each}}`,
};
