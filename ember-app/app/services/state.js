import Ember from 'ember';

export default Ember.Service.extend({

  lastfm: Ember.Object.create({
    albums: Ember.Object.create({
      overall: null,
      "7day": null,
      "1month": null,
      "3month": null,
      "6month": null,
      "12month": null
    }),
    artists: Ember.Object.create({
      overall: null,
      "7day": null,
      "1month": null,
      "3month": null,
      "6month": null,
      "12month": null
    })
  }),

  instagram: []

});
