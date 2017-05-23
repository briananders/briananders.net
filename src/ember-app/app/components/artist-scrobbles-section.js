import Ember from 'ember';

export default Ember.Component.extend({


  stateService: Ember.inject.service('state'),


  showDescription: false,


  classNameBindings: [':artists', 'error:hidden', 'noartists:hidden'],


  artists: [],


  noArtists: Ember.computed.empty('artists'),


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
        limit: 24, // 1 artist - 50 artists
        period: '1month' //overall|7day|1month|3month|6month|12month
      };

      if(Ember.isEmpty(this.get(`stateService.lastfm.artists.${lfmOpts.period}`))) {

        Ember.$.ajax({
          type: 'GET',
          url: ('http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=' +
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
            if(data.topartists === undefined) {
              this.set('error', true);
              return;
            }
            var artists = [];

            data.topartists.artist.forEach(function(artist) {
              if(!Ember.isEmpty(artist.image[artist.image.length-1]['#text']) &&
                  artist.image[artist.image.length-1]['#text'].indexOf('default')) {
                artist.image = artist.image[artist.image.length-1]['#text'];
                artists.push(artist);
              }
            }.bind(this));

            this.set('artists', artists);
            this.set(`stateService.lastfm.artists.${lfmOpts.period}`, artists);

          }.bind(this),
          error: function() {
            this.set('error', true);
          }.bind(this)

        });

      } else {
        this.set('artists', this.get(`stateService.lastfm.artists.${lfmOpts.period}`));
      }

    });

  }

});
