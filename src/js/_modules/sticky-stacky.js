/**
 * class StickyStacky element controller
 */
function StickyStacky(containerElement) {
  let previousHeights = 0;

  this.stickyElement = containerElement.querySelector('.sticky-stacky');
  this.top = window.pageYOffset + containerElement.getBoundingClientRect().top;
  this.height = this.stickyElement.offsetHeight;
  this.isStuck = false;

  /*
    Simply get the peeking value stored in the CSS variable
  */
  function getCurrentTransform() {
    const valueString = document.documentElement.style.getPropertyValue('--sticky-stacky-transform');
    return Number(valueString.slice(0, -2)); // slice removes the 'px' from the value.
  }

  /*
    Recalculates the sticky-container-height CSS variable
  */
  function recalculate() {
    /* 
      Determine if the bar should be stuck by comparing the (scroll position 
      of page) + (how much the stack is peeking) to the top of the .sticky-container element.
    */
    this.isStuck = window.pageYOffset + (previousHeights + getCurrentTransform()) > this.top;

    // add/remove .fixed class based on stuck status.
    if (this.isStuck) {
      this.stickyElement.classList.add('fixed');
    } else {
      this.stickyElement.classList.remove('fixed');
    }

    // update top value, height value, and set the container height CSS variable.
    this.top = window.pageYOffset + containerElement.getBoundingClientRect().top;
    this.height = this.stickyElement.offsetHeight;
    containerElement.style.setProperty('--sticky-container-height', `${this.height}px`);
  }

  /*
    Take the `heights` parameter and set it as a CSS variable.
    Note: this value will be different for each StickyStack instance. 
      It's the sum of the heights of the StickyStacks earlier in the DOM.
  */
  this.setPreviousHeights = (heights) => {
    previousHeights = heights;
    containerElement.style.setProperty('--previous-heights', `${heights}px`);
  };

  /*
    External call to recalculate all of the values
  */
  this.update = recalculate;
}

/**
 * class StickyController global controller for StickyStacky elements
 */
function StickyController(containerNodeList) {
  /* 
    Since the querySelectorAll function returns NodeLists,
    convert this to an Array so we can use .map and .forEach on it.
  */
  const containerArray = Array.from(containerNodeList);
  let scrollHeight = 0;
  let transformTop = 0;
  let maxTransform = 0;

  /*
    Sort the sticky stack elements in visual order from top to bottom.
  */
  const stickyStacks = containerArray
    .map((containerElement) => new StickyStacky(containerElement))
    .sort((stackA, stackB) => (stackA.top < stackB.top ? -1 : 1));

  /*
    Set incrementally higher z-index values to ensure the 
    shadows cascade without overlapping
  */
  stickyStacks.forEach((stack, index) => {
    stack.stickyElement.style.zIndex = 10000 + index;
  });

  /*
    Simply filter the stuck StickyStacks (isStuck === true) from all StickyStacks
  */
  function getStuckStacks() {
    return stickyStacks.filter((stickyStack) => stickyStack.isStuck);
  }

  /*
    Take the StickyStacks that are stuck (isStuck === true), then
    sort them by visual order on the page. Finally, loop over
    them to apply the shadows appropriately, and set the previous 
    height for each stuck stack.
  */
  function calculateMaxTransform() {
    let height = 0;
    const stuckStacks = getStuckStacks()
      .sort((stackA, stackB) => (stackA.top < stackB.top ? -1 : 1));
    
    stuckStacks.forEach((stuckStack, index) => {
      if (index === stuckStacks.length - 1) { 
        // last stuck element gets the shadow
        maxTransform = 0 - height; // set global variable. Must be a negative number.
        stuckStack.stickyElement.classList.add('shadow');
      } else {
        // other stuck elements lose the shadow
        stuckStack.stickyElement.classList.remove('shadow');
      }
      // accumulate heights and set them, just like in recalculateHeights()
      stuckStack.setPreviousHeights(height);
      height += stuckStack.height;
    });
  }

  /*
    Loop through the StickyStacks, accumulate the heights of each
    StickyStack and pass those previous height sums into the StickyStacks
  */
  function recalculateHeights() {
    let height = 0;
    stickyStacks.forEach((stickyStack) => {
      stickyStack.update();
      stickyStack.setPreviousHeights(height);
      height += stickyStack.height;
    });
  }

  /*
    [Critical function] Calculates the scroll directin and adjusts
    the sticky stack peeking depth.
  */
  function update() {
    calculateMaxTransform(); // sets maxTransform value.

    // Don't make any changes if the scroll depth hasn't changed.
    if (scrollHeight !== window.pageYOffset) { 
      // determine the scroll depth difference
      const diff = scrollHeight - window.pageYOffset; 
      // set global variable value for next time. Effectively caching the current value for later.
      scrollHeight = window.pageYOffset; 
      // calculate the peeking depth. It cannot be greater than zero or less than the maxTransform
      transformTop = Math.max(Math.min(transformTop + diff, 0), maxTransform);
      // set the peeking depth in the CSS variable
      document.documentElement.style.setProperty('--sticky-stacky-transform', `${transformTop}px`);
    }

    recalculateHeights(); // update the StickyStack height and previousHeights again
  }

  /*
    Update _AFTER_ the scroll event fires. I tried using other kinds of run loops,
    but this one performs the best without odd delayed overlaps.
    Do not debounce.
  */
  window.addEventListener('scroll', update.bind(this));

  /*
    Running this twice at the beginning with these spaces seems to work well.
  */
  setTimeout(update.bind(this), 0);
  setTimeout(update.bind(this), 100);
}


/*
  Module initializer function.
*/
module.exports.init = () => {
  /* get all of the .sticky-container elements on the page */
  const stickyContainers = document.querySelectorAll('.sticky-container');

  /*
    Instantiating a StickyController class with the stickyContainers
    triggers the calculation and update of all sticky stacky elements
  */
  StickyController(stickyContainers);
};
