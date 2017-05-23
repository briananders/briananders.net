import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('thoughts', function() {
    this.route('minesweeper');
    this.route('last-fm');
  });
});

export default Router;
