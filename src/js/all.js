/* globals document */

module.exports = {

  init() {
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
