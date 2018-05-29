/* globals document */

const fmt = require('simple-fmt');

module.exports = {

  init() {
    const variation = Math.floor(Math.random() * 7);
    document.body.classList.add(fmt('variation-{0}', variation));

    this.setupNavEvents();
  },

  setupNavEvents() {
    const menuButton = document.querySelector('#activate-menu');
    const mainNavContent = document.querySelector('nav.main .content');
    menuButton.addEventListener('click', () => {
      if (mainNavContent.classList.contains('mobile-active')) {
        mainNavContent.classList.remove('mobile-active');
      } else {
        mainNavContent.classList.add('mobile-active');
      }
    });
  },

};
