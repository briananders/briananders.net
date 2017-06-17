import Ember from 'ember';

export default Ember.Service.extend({

  lastFmDuration: '1month',

  lastFmDurationOptions: [
    {
      value: 'overall',
      string: 'Forever',
    },
    {
      value: '7day',
      string: '1 week',
    },
    {
      value: '1month',
      string: '1 month',
    },
    {
      value: '3month',
      string: '3 months',
    },
    {
      value: '6month',
      string: '6 months',
    },
    {
      value: '12month',
      string: '1 year',
    }
  ],

  lastfm: Ember.Object.create({
    albums: Ember.Object.create({
      overall: null,
      '7day': null,
      '1month': null,
      '3month': null,
      '6month': null,
      '12month': null,
    }),
    artists: Ember.Object.create({
      overall: null,
      '7day': null,
      '1month': null,
      '3month': null,
      '6month': null,
      '12month': null,
    }),
  }),

});
