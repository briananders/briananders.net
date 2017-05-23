import Ember from 'ember';

export default Ember.Component.extend({



  classNameBindings: [':mine-sweeper-tile',
                      'showValueClass',
                      'model.active:active',
                      'model.flag:flag',
                      'iAmTheLastSquare:red'],



  model: null,



///////////////////////// Computed Properties



  showValueClass: Ember.computed('model.active',
                                  'model.value',
                                  'model.mine',
                                  'gameOver',
                                  function() {

    if(this.get('gameOver')) {
      if(this.get('model.flag') && !this.get('model.mine')) {
        return 'not-flag';
      } else if(this.get('model.mine')) {
        return 'mine';
      }
    }

    if(this.get('model.flag')) {
      return 'flag';
    }

    if(this.get('model.mine')) {
      return '';
    }

    if(this.get('model.active')) {
      return ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'][this.get('model.value')];
    }
    return '';

  }),



  showValue: Ember.computed('model.active', 'model.value', function() {

    if(this.get('model.active')) {
      if(this.get('model.value') === 0) {
        return '';
      }
      return this.get('model.value');
    }
    return '';

  }),



  fireLose: Ember.computed.and('model.active', 'model.mine'),



  gameOver: Ember.computed.alias('model.controller.gameOver'),



  lastSquare: Ember.computed.alias('model.controller.lastSquare'),



  iAmTheLastSquare: Ember.computed('lastSquare', 'model.location', function() {
    if(Ember.isEmpty(this.get('lastSquare'))) {
      return false;
    }

    return this.get('lastSquare')[0] === this.get('model.location')[0] &&
           this.get('lastSquare')[1] === this.get('model.location')[1];
  }),




//////////////////////// Click handlers



  click() {

    if(this.get('gameOver')) {
      return undefined;
    } else if(!this.get('model.controller.minesSet')) {
      this.get('model.controller').setMines(this.get('model.location'));
    }

    if(this.get('model.active')) {
      //reveal surrounding squares
      this.get('model.controller').send('tryRevealSurrounding', this.get('model.location'), this.get('model.value'));
    } else if(!this.get('model.flag')) {
      this.set('model.active', true);
      if(!this.get('fireLose') && this.get('model.value') === 0) {
        this.get('model.controller').send('tryRevealSurrounding', this.get('model.location'), this.get('model.value'));
      }
    }

    this.get('model.controller').playing();

  },



  //right click
  contextMenu(e) {

    e.preventDefault();

    if(this.get('gameOver')) {
      return undefined;
    }

    if(!this.get('model.active')) {
      this.toggleProperty('model.flag');

      this.get('model.controller').countFlags();
    }

    this.get('model.controller').playing();

  },



  mouseDown(e) {
    if(e.which === 1 && !this.get('model.active') && !this.get('gameOver')) {
      this.set('model.controller.tileMouseDown', true);
    }
  },



  mouseUp(e) {
    this.set('model.controller.tileMouseDown', false);
  }



});
