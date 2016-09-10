import Ember from 'ember';

export default Ember.Component.extend({


  tagName: 'img',


  attributeBindings: ['src', 'alt'],


  classNames: ['image-tag'],


  classNameBindings: ['loaded:loaded'],


  loaded: false,


  willInsertElement() {

    if(window.isRetina && !Ember.isEmpty(this.get('src-2x'))) {
      this.set('src', this.get('src-2x'));
    } else if(!Ember.isEmpty(this.get('src-1x'))) {
      this.set('src', this.get('src-1x'));
    }

  },


  didInsertElement() {

    Ember.run(this, function() {

      this.$().on('load', function(){

        Ember.run(this, function(){
          this.set('loaded', true);
        });

      }.bind(this));

    });

  },



});
