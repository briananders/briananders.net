import Ember from 'ember';

export default Ember.Component.extend({


  stateService: Ember.inject.service('state'),


  showDescription: false,


  classNameBindings: [':albums', 'error:hidden', 'noAlbums:hidden'],


  albums: [],


  noAlbums: Ember.computed.empty('albums'),


  error: false,


  length: null,


  didInsertElement() {

    Ember.run(this, function() {

      /*
        LastFM api call and dom loads
      */
      var lfmOpts = {
        APIkey: '6a77d69fd4f528fe5101f0e2e4912e8c',
        User: 'iBrianAnders',
        limit: 24, // 1 album - 50 albums
        period: '1month' //overall|7day|1month|3month|6month|12month
      };

      if(Ember.isEmpty(this.get(`stateService.lastfm.albums.${lfmOpts.period}`))) {

        Ember.$.ajax({
          type: 'GET',
          url: ('http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=' +
                  lfmOpts.User +
                  '&period=' +
                  lfmOpts.period +
                  '&api_key=' +
                  lfmOpts.APIkey +
                  '&format=json&limit=' +
                  lfmOpts.limit  +
                  '&callback=?'),
          dataType: 'json',
          success: function(data) {
            if(data.topalbums === undefined) {
              this.set('error', true);
              return;
            }
            var albums = [];

            data.topalbums.album.forEach(function(album) {
              if(!Ember.isEmpty(album.image[album.image.length-1]['#text']) &&
                  album.image[album.image.length-1]['#text'].indexOf('default')) {
                album.image = album.image[album.image.length-1]['#text'];
                albums.push(album);
              }
            }.bind(this));

            this.set('albums', albums);
            this.set(`stateService.lastfm.albums.${lfmOpts.period}`, albums);

          }.bind(this),
          error: function() {
            this.set('error', true);
          }.bind(this)

        });

      } else {
        this.set('albums', this.get(`stateService.lastfm.albums.${lfmOpts.period}`));
      }

    });

  }

});
