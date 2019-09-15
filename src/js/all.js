/* globals document */

const queryParameters = require('./_modules/queryParameters');

module.exports = {

  parameters: queryParameters(),

  init() {
    const analytics = require('./_modules/analytics');

    this.setupNavEvents(analytics);
    this.testForTouch();
    this.navScrollWatcher();
    this.setMainMinHeight();

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

  navScrollWatcher() {
    const mainNav = document.querySelector('nav.main');

    const checkScrollDepth = () => {
      if (window.scrollY <= 0) {
        mainNav.classList.remove('shadow');
      } else {
        mainNav.classList.add('shadow');
      }
    };

    window.addEventListener('scroll', checkScrollDepth);
    checkScrollDepth();
  },

  testForTouch() {
    if ('ontouchstart' in document.documentElement) {
      document.documentElement.classList.add('touch-events');
    } else {
      document.documentElement.classList.add('no-touch-events');
    }
  },

  setMainMinHeight() {
    const mainElement = document.querySelector('main');
    const footerElement = document.querySelector('footer');

    const calculateMinHeight = () => {
      const docHeight = document.documentElement.clientHeight;
      const { bottom } = footerElement.getBoundingClientRect();
      const { height } = mainElement.getBoundingClientRect();

      const heightDelta = docHeight - bottom;

      mainElement.style.minHeight = `${height + heightDelta}px`;
    };

    calculateMinHeight();
    window.addEventListener('resize', calculateMinHeight);
    window.addEventListener('orientationchange', calculateMinHeight);
  },

};
