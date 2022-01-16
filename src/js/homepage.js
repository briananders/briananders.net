const itemApi = require('./_modules/last-fm/item-api');

(function homepage() {
  itemApi.init({
    count: 4,
    description: false,
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
}());
