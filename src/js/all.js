/* globals document */

const fmt = require('simple-fmt');

module.exports = {

  init() {
    console.debug('all.js');

    const variation = Math.floor(Math.random() * 7);
    document.body.classList.add(fmt('variation-{0}', variation));

    this.setupNavEvents();
  },

  setupNavEvents() {
    document.querySelector('#activate-menu').addEventListener('click', function () {
      if (this.parentElement.classList.contains('mobile-active')) {
        this.parentElement.classList.remove('mobile-active');
      } else {
        this.parentElement.classList.add('mobile-active');
      }
    });
  },

};
