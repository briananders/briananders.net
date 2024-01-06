const yearTemplate = `
  <style>
    .bar {
      display: flex;
      width: var(--bar-width, 1%);
      height: 24px;
      background-color: var(--palette--primary-color-light);
      background: linear-gradient(to right, var(--palette--primary-color-dark), var(--palette--primary-color-light));
      position: absolute;
      left: 0;
      top: 0;
      overflow: hidden;
      border-radius: 3px;
      align-items: center;
    }

    .bar slot {
      color: black;
      text-shadow: 0 1px 1px white;
    }

    .bar-container {
      display: block;
      width: 100%;
      overflow: hidden;
      position: relative;
    }

    slot {
      margin-left: 5px;
      display: inline;
      font-family: "Roboto", sans-serif;
      font-size: 14px;
      font-weight: 700;
      display: block;
    }
  </style>

  <span slot="year">2000</span>
  <span class="bar-container">
    <slot>Value</slot>
    <span class="bar">
      <slot>Value</slot>
    </span>
  </span>
`;

const attributes = ["year", "value", "maximum"];

class YearListing extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = yearTemplate;
    this.width = 0;

    this.barElement = this.shadowRoot.querySelector('.bar');
  }

  static get observedAttributes() {
    return attributes;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.barElement = this.shadowRoot.querySelector('.bar');

    // console.log(name, oldValue, newValue);
    if (name === "value") {
      [...this.shadowRoot.querySelectorAll(`slot`)].forEach((element) => { element.innerText = newValue; });
    }
    if (name === "year") {
      this.shadowRoot.querySelector(`[slot="${name}"]`).innerText = newValue;
    }
    if (['maximum', 'value'].includes(name)) {
      const maximum = Number(this.getAttribute('maximum') || 1);
      const value = Number(this.getAttribute('value') || 0);
      this.animateTo(value / maximum * 100);
    }
  }

  animateTo(newValue) {
    const FPS = 60;
    const frameSpeed = 1000 / FPS;
    const stepSize = 1;
    const barElement = this.barElement;
    const width = this.width;

    let step = 0;

    run();
    function run() {
      step++;
      barElement.style.setProperty('--bar-width', width + (stepSize * step) + "%");

      if (width + (stepSize * step) < newValue) {
        setTimeout(run, frameSpeed);
      } else {
        this.width = newValue;
      }
    }
  }

  // connectedCallback() {
  //   console.log('connected');
  // }

  // disconnectedCallback() {
  //   console.log('disconnected');
  // }
}

module.exports.init = () => {
  customElements.define('year-listing', YearListing);
};