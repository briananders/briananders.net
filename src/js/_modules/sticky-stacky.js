const stickyContainers = document.querySelectorAll('.sticky-container');

function StickyStacky(containerElement) {
  let previousHeights = 0;

  this.stickyElement = containerElement.firstElementChild;
  this.top = window.pageYOffset + containerElement.getBoundingClientRect().top;
  this.height = this.stickyElement.offsetHeight;
  this.isStuck = false;

  const getCurrentTransform = () => {
    const valueString = document.documentElement.style.getPropertyValue('--sticky-stacky-transform');
    return Number(valueString.slice(0, -2));
  };

  this.setPreviousHeights = (heights) => {
    previousHeights = heights;
    containerElement.style.setProperty('--previous-heights', `${heights}px`);
  };

  const recalculate = () => {
    this.isStuck = window.pageYOffset + (previousHeights + getCurrentTransform()) > this.top;

    if (this.isStuck) {
      this.stickyElement.classList.add('fixed');
    } else {
      this.stickyElement.classList.remove('fixed');
    }

    this.top = window.pageYOffset + containerElement.getBoundingClientRect().top;
    this.height = this.stickyElement.offsetHeight;
    containerElement.style.setProperty('--sticky-container-height', `${this.height}px`);
  };

  this.update = recalculate;
}

function StickyController(containerNodeList) {
  const containerArray = Array.from(containerNodeList);
  let scrollHeight = 0;
  let transformTop = 0;
  let maxTransform = 0;

  const stickyStacks = containerArray
    .map((containerElement) => new StickyStacky(containerElement))
    .sort((stackA, stackB) => (stackA.top < stackB.top ? -1 : 1));

  stickyStacks.forEach((stack, index) => {
    stack.stickyElement.style.zIndex = 10000 + index;
  });

  const getStuckStacks = () => stickyStacks.filter((stickyStack) => stickyStack.isStuck);

  const calculateMaxTransform = () => {
    let height = 0;
    const stuckStacks = getStuckStacks()
      .sort((stackA, stackB) => (stackA.top < stackB.top ? -1 : 1));
    stuckStacks.forEach((stuckStack, index) => {
      if (index === stuckStacks.length - 1) { // last stack
        maxTransform = 0 - height;
        stuckStack.stickyElement.classList.add('shadow');
      } else {
        stuckStack.stickyElement.classList.remove('shadow');
      }
      stuckStack.setPreviousHeights(height);
      height += stuckStack.height;
    });
  };

  const recalculateHeights = () => {
    let height = 0;
    stickyStacks.forEach((stickyStack) => {
      stickyStack.update();
      stickyStack.setPreviousHeights(height);
      height += stickyStack.height;
    });
  };

  const update = () => {
    calculateMaxTransform();

    if (scrollHeight !== window.pageYOffset) {
      const diff = scrollHeight - window.pageYOffset;
      scrollHeight = window.pageYOffset;
      transformTop = Math.max(Math.min(transformTop + diff, 0), maxTransform);
      document.documentElement.style.setProperty('--sticky-stacky-transform', `${transformTop}px`);
    }

    recalculateHeights();
  };

  window.addEventListener('scroll', update.bind(this));
  setTimeout(update.bind(this), 0);
  setTimeout(update.bind(this), 100);
}

module.exports.init = () => {
  StickyController(stickyContainers);
};
