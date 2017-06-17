import Ember from 'ember';

export default Ember.Component.extend({


  state: Ember.inject.service(),


  url: Ember.computed('state.lastFmDuration', function () {
    const period = this.get('state.lastFmDuration');

    var lfmOpts = {
      APIkey: '6a77d69fd4f528fe5101f0e2e4912e8c',
      User: 'iBrianAnders',
      limit: 24, // 1 album - 50 albums
    };

    return `http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${
      lfmOpts.User
      }&period=${
      period
      }&api_key=${
      lfmOpts.APIkey
      }&format=json&limit=${
      lfmOpts.limit
      }`;
  }),


  showDescription: false,


  classNameBindings: [':albums', 'error:hidden', 'noAlbums:hidden'],


  init() {
    this._super(...arguments);
    this.getAlbumData();
  },


  getAlbumData() {
    /*
      LastFM api call and dom loads
    */
    const period = this.get('state.lastFmDuration');
    const url = this.get('url');
    const cachedData = this.get(`state.lastfm.albums.${period}`);

    if (Ember.isEmpty(cachedData)) {
      Ember.$.ajax({
        type: 'GET',
        url,
        dataType: 'json',
        success: function (data) {
          if (data.topalbums === undefined) {
            this.set('error', true);
            return;
          }
          const albums = [];

          data.topalbums.album.forEach((album) => {
            if (!Ember.isEmpty(album.image[album.image.length - 1]['#text']) &&
                album.image[album.image.length - 1]['#text'].indexOf('default')) {
              album.image = album.image[album.image.length - 1]['#text'];
              albums.push(album);
            }
          });

          this.set(`state.lastfm.albums.${period}`, albums);
          this.set('albums', albums);
        }.bind(this),
        error: function () {
          this.set('error', true);
        }.bind(this),
      });
    } else {
      this.set('albums', cachedData);
    }
  },


  observesDuration: Ember.observer('state.lastFmDuration', function () {
    this.getAlbumData();
  }),


  albums: [],


  noAlbums: Ember.computed.empty('albums'),


  error: false,


  length: null,


  // didInsertElement() {
  //   Ember.run(this, function () {

  //   });
  // },

});
