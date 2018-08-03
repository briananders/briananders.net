/* globals document */

module.exports = {

  init() {
    this.setupNavEvents();
    this.testForTouch();
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

  testForTouch() {
    if ('ontouchstart' in document.documentElement) {
      document.documentElement.classList.add('touch-events');
    } else {
      document.documentElement.classList.add('no-touch-events');
    }
  },

};
