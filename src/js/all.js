/* globals document */

module.exports = {

  init() {
    const analytics = require('./_modules/analytics');

    this.setupNavEvents(analytics);
    this.testForTouch();

    analytics.watchElements();
  },

  setupNavEvents(analytics) {
    const menuButton = document.querySelector('#activate-menu');
    const mainNavContent = document.querySelector('nav.main .content');
    menuButton.addEventListener('click', () => {
      if (mainNavContent.classList.contains('mobile-active')) {
        analytics.pushEvent({
          category: 'nav',
          action: 'menu close',
        });
        mainNavContent.classList.remove('mobile-active');
      } else {
        analytics.pushEvent({
          category: 'nav',
          action: 'menu open',
        });
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
