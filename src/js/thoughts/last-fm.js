const itemApi = require('../_modules/last-fm/item-api');

module.exports = {
  init() {
    console.debug('last-fm.js');
    itemApi.init({
      count: 12,
      description: true,
      method: 'user.gettopartists',
      scope: '.last-fm-module[data-type=artists]',
      customSerialize(data) {
        return data.topartists.artist;
      },
    });
    itemApi.init({
      count: 12,
      description: true,
      method: 'user.gettopalbums',
      scope: '.last-fm-module[data-type=albums]',
      customSerialize(data) {
        return data.topalbums.album;
      },
    });
  },
};
