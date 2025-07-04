const itemApi = require('../_modules/last-fm/item-api');
const ready = require('../_modules/document-ready');

ready.document(() => {
  require('../_components/album-listing').init();
  require('../_components/artist-listing').init();

  const moreAlbumsLink = document.querySelector('.more.albums').setAttribute('href', data.sources.album);
  const moreArtistsLink = document.querySelector('.more.artists').setAttribute('href', data.sources.artist);

  itemApi.init({
    count: 10,
    description: true,
    method: 'user.gettopartists',
    scope: '.last-fm-module[data-type=artists]',
    customSerialize(data) {
      return data.topartists.artist;
    },
  });
  itemApi.init({
    count: 10,
    description: true,
    method: 'user.gettopalbums',
    scope: '.last-fm-module[data-type=albums]',
    customSerialize(data) {
      data.topalbums.album.forEach((item) => {
        item.imageSrc = data.defaultImage;
        const mediumImageArray = item.image.filter((image) => image.size === 'large');
        if (mediumImageArray.length && mediumImageArray[0]['#text'].length) {
          item.imageSrc = mediumImageArray[0]['#text'];
        }
      });

      return data.topalbums.album;
    },
  });
});
