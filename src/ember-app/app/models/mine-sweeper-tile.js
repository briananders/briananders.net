import Ember from 'ember';

export default Ember.Object.extend({


  controller: null,


  adjacentValue: 0,


  mine: false,


  active: false,


  location: null,


  flag: false,


  row: Ember.computed('location', function () {
    return this.get('location')[0];
  }),


  column: Ember.computed('location', function () {
    return this.get('location')[1];
  }),


  value: Ember.computed('controller.rowsAndColumns.[].[]', function () {
    var mines = 0;

    for (let r = this.get('row') - 1; r <= this.get('row') + 1; r++) {
      for (let c = this.get('column') - 1; c <= this.get('column') + 1; c++) {
        if (!Ember.isEmpty(this.get('controller.rowsAndColumns')[r]) &&
           !Ember.isEmpty(this.get('controller.rowsAndColumns')[r][c]) &&
           this.get('controller.rowsAndColumns')[r][c].mine) {
          mines++;
        }
      }
    }

    return mines;
  }),


  observesActive: Ember.observer('active', function () {
    if (this.get('active') && this.get('mine')) {
      this.get('controller').send('lose', this.get('location'));
    }
  }),


});
