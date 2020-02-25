function updateOnIntersect(element, observer) {
  if (element.tagName === 'IMG') {
    element.src = element.dataset.src;
  } else if (element.hasAttribute('data-lazy-style')) {
    element.style.cssText += element.dataset.lazyStyle;
  }
  if (observer) observer.unobserve(element);
}

module.exports = {
  init(specificQuery = 'body') {
    if (window.IntersectionObserver) {
      const intersectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updateOnIntersect(entry.target, observer);
          }
        });
      }, {
        rootMargin: '0px 0px 0px 0px',
      });

      document.querySelectorAll(`${specificQuery} [lazy]`).forEach((element) => {
        intersectionObserver.observe(element);
      });
    } else {
      document.querySelectorAll(`${specificQuery} [lazy]`).forEach((element) => {
        updateOnIntersect(element);
      });
    }
  },
};
