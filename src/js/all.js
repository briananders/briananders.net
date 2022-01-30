const analytics = require('./_modules/analytics');
const lazyLoader = require('./_modules/lazy-loader');
const { blindfoldToggle } = require('./_modules/blindfold-mode');

(function all() {
  function setupNavEvents() {
    const menuButton = document.getElementById('activate-menu');
    const navTray = document.getElementById('nav-tray');
    menuButton.addEventListener('click', () => {
      if (menuButton.getAttribute('aria-expanded') === 'true') { // it's open
        analytics.pushEvent({
          category: 'nav',
          action: 'menu close',
        });
        navTray.classList.remove('slide-down');

        setTimeout(() => {
          menuButton.setAttribute('aria-expanded', 'false');
          navTray.setAttribute('aria-hidden', 'true');
        }, 300);
      } else { // it's closed
        analytics.pushEvent({
          category: 'nav',
          action: 'menu open',
        });
        menuButton.setAttribute('aria-expanded', 'true');
        navTray.setAttribute('aria-hidden', 'false');

        setTimeout(() => {
          navTray.classList.add('slide-down');
        }, 100);
      }
    });
  }

  function setUpSkipNav() {
    const skipNavContainer = document.getElementById('skip-nav');
    const skipNavButton = skipNavContainer.querySelector('a');

    skipNavButton.addEventListener('focus', () => {
      skipNavContainer.dataset.state = 'active';
    });
    skipNavButton.addEventListener('blur', () => {
      skipNavContainer.dataset.state = 'inactive';
    });
    skipNavButton.addEventListener('click', () => {
      const main = document.getElementById('skip-to-main');
      main.setAttribute('tabindex', '0');
      // main.focus();
    });
  }

  function navScrollWatcher() {
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
  }

  function testForTouch() {
    if ('ontouchstart' in document.documentElement) {
      document.documentElement.classList.add('touch-events');
    } else {
      document.documentElement.classList.add('no-touch-events');
    }
  }

  function setMainMinHeight() {
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
  }

  function preventFormSubmit() {
    const formElements = document.querySelectorAll('form');
    formElements.forEach((element) => {
      element.addEventListener('keydown', (evt) => {
        if (evt.key === 'Enter') evt.preventDefault();
      });
    });
  }

  blindfoldToggle();

  preventFormSubmit();

  setupNavEvents(analytics);

  testForTouch();

  navScrollWatcher();

  setMainMinHeight();

  setUpSkipNav();

  lazyLoader.init();
  analytics.watchElements();
}());
