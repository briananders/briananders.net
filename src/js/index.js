const itemApi = require('./_modules/last-fm/item-api');

module.exports = {
  init() {
    console.debug('index.js');
    itemApi.init({
      count: 4,
      description: false,
      method: 'user.gettopalbums',
      scope: '.last-fm-module[data-type=albums]',
      customSerialize(data) {
        return data.topalbums.album;
      },
    });
  },
};
