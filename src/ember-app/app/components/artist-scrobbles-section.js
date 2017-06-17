import Ember from 'ember';

export default Ember.Component.extend({


  state: Ember.inject.service(),


  url: Ember.computed('state.lastFmDuration', function () {
    const period = this.get('state.lastFmDuration');

    var lfmOpts = {
      APIkey: '6a77d69fd4f528fe5101f0e2e4912e8c',
      User: 'iBrianAnders',
      limit: 24, // 1 artist - 50 artists
    };

    return `http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${
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


  classNameBindings: [':artists', 'error:hidden', 'noartists:hidden'],


  init() {
    this._super(...arguments);
    this.getArtistData();
  },


  getArtistData() {
    /*
      LastFM api call and dom loads
    */
    const period = this.get('state.lastFmDuration');
    const url = this.get('url');
    const cachedData = this.get(`state.lastfm.artists.${period}`);

    if (Ember.isEmpty(cachedData)) {
      Ember.$.ajax({
        type: 'GET',
        url,
        dataType: 'json',
        success: function (data) {
          if (data.topartists === undefined) {
            this.set('error', true);
            return;
          }
          const artists = [];

          data.topartists.artist.forEach((artist) => {
            if (!Ember.isEmpty(artist.image[artist.image.length - 1]['#text']) &&
              artist.image[artist.image.length - 1]['#text'].indexOf('default')) {
              artist.image = artist.image[artist.image.length - 1]['#text'];
              artists.push(artist);
            }
          });

          this.set(`state.lastfm.artists.${period}`, artists);
          this.set('artists', artists);
        }.bind(this),
        error: function () {
          this.set('error', true);
        }.bind(this),
      });
    } else {
      this.set('artists', cachedData);
    }
  },


  observesDuration: Ember.observer('state.lastFmDuration', function () {
    this.getArtistData();
  }),


  artists: [],


  noArtists: Ember.computed.empty('artists'),


  error: false,


  length: null,


  // didInsertElement() {
  //   Ember.run(this, function () {

  //   });
  // },

});
