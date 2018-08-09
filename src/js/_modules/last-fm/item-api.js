const handlebars = require('handlebars');
const $ = require('jquery');

const config = require('./config');
const template = require('./template');

let period = '1month'; // default
const cache = {};

module.exports = {
  init(opts) {
    const containerElement = document.querySelector(opts.scope);
    opts.description = opts.description || false; // defaults
    opts.count = opts.count || 4; // defaults

    function getURL() {
      return `https://ws.audioscrobbler.com/2.0/?method=${opts.method}&user=${
        config.user
      }&period=${
        period
      }&api_key=${
        config.apiKey
      }&format=json&limit=${
        config.limit
      }`;
    }

    function render() {
      const url = getURL();
      const data = cache[url];
      const handlebarsData = Object.assign({}, opts, { items: data });

      const compiledHandlebars = handlebars.compile(template);
      const outputHTML = compiledHandlebars(handlebarsData);
      containerElement.innerHTML = outputHTML;
    }

    function serialize(data) {
      const items = opts.customSerialize(data);
      items.forEach((item) => {
        item.imageSrc = item.image[item.image.length - 1]['#text'] || '';
      });
      const filterItem = items.filter(item => item.imageSrc !== '');
      const shortenedItem = filterItem.filter((item, index) => index < opts.count);
      return shortenedItem;
    }

    function getData() {
      const url = getURL();
      if (cache[url]) {
        render();
      } else {
        $.ajax({
          type: 'GET',
          url,
          dataType: 'json',
          success(data) {
            cache[url] = serialize(data);
            render();
          },
        });
      }
    }

    function watchPeriod() {
      const periodElement = document.querySelector('select[name=period]');
      if (periodElement !== null) {
        period = periodElement.value;
        periodElement.addEventListener('change', () => {
          period = periodElement.value;
          getData();
        });
      }
    }


    watchPeriod();
    getData();
  },
};
