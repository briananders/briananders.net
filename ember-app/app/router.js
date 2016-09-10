import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {

  this.route('thoughts', function() {
    this.route('minesweeper');
    this.route('last-fm');
  });

});

export default Router;
