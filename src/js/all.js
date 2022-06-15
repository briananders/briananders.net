const analytics = require('./_modules/analytics');
const lazyLoader = require('./_modules/lazy-loader');
const noAnimations = require('./_modules/no-animations');
const ready = require('./_modules/document-ready');

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
    const skipNavButton = skipNavContainer.querySelector('button');
    const nonNavContainerSelectors = ['main', 'footer'];
    const interactiveElements = ['a', 'input', 'button', 'textarea', 'select'];
    const querySelectors = nonNavContainerSelectors.map((container) => interactiveElements.map((input) => `${container} ${input}`));

    skipNavButton.addEventListener('focus', () => {
      skipNavContainer.dataset.state = 'active';
    });
    skipNavButton.addEventListener('blur', () => {
      skipNavContainer.dataset.state = 'inactive';
    });
    skipNavButton.addEventListener('click', () => {
      const firstInput = document.querySelector(querySelectors.join(', '));
      firstInput.focus();
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

  ready.document(() => {
    preventFormSubmit();
    setupNavEvents(analytics);
    testForTouch();
    navScrollWatcher();
    setMainMinHeight();
    setUpSkipNav();
    noAnimations.initBodyClass();

    lazyLoader.init();
    analytics.watchElements();
  });
}());
