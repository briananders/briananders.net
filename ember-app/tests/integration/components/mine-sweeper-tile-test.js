import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('mine-sweeper-tile', 'Integration | Component | mine sweeper tile', {
  integration: true
});

test('it renders', function(assert) {
  
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

  this.render(hbs`{{mine-sweeper-tile}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:" + EOL +
  this.render(hbs`
    {{#mine-sweeper-tile}}
      template block text
    {{/mine-sweeper-tile}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
