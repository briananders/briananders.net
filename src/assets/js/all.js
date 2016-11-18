var fmt = require('simple-fmt');

module.exports = {
  init: function() {
    console.debug("all.js");

    var variation = Math.floor(Math.random() * 7);
    document.body.classList.add(fmt('variation-{0}', variation));

    this.navSetup();
  },

  navSetup: function() {
    var openButton = document.getElementById('menu-open');
    var closeButton = document.getElementById('menu-close');
    var aside = document.getElementById('nav-aside');

    openButton.addEventListener('click', function() {
      document.body.classList.add('nav-active');
    });
    closeButton.addEventListener('click', function() {
      document.body.classList.remove('nav-active');
    });
  }
}