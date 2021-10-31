const itemApi = require('./_modules/last-fm/item-api.js');

(function homepage() {
  itemApi.init({
    count: 4,
    description: false,
    method: 'user.gettopalbums',
    scope: '.last-fm-module[data-type=albums]',
    customSerialize(data) {
      data.topalbums.album.forEach((item) => {
        item.imageSrc = '/images/thoughts/last-fm/default.png';
        const mediumImageArray = item.image.filter((image) => image.size === 'large');
        if (mediumImageArray.length) {
          item.imageSrc = mediumImageArray[0]['#text'] || '/images/thoughts/last-fm/default.png';
        }
      });

      return data.topalbums.album;
    },
  });
}());
