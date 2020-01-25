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
      const maxPlayCount = Math.max(...items.map(item => Number(item.playcount)));
      items.forEach((item) => {
        const playCount = Number(item.playcount);
        item.percent = playCount / maxPlayCount * 100;
      });
      const shortenedItem = items.filter((item, index) => index < opts.count);
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
