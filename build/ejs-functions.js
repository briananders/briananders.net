const ejs = require('ejs');
const fs = require('fs');
const hljs = require('highlight.js');
const merge = require('merge');
const sizeOf = require('image-size');
const path = require('path');

function squeakyClean(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == null || arr[i] === '') {
      arr.splice(i, 1);
    }
  }
  return arr;
}

module.exports = (dir, pageMappingData) => ({
  partial(partialPath, data) {
    const newPath = `${dir.src}partials/${partialPath}.ejs`;

    return ejs.render(fs.readFileSync(newPath).toString(), data, {
      compileDebug: true,
    });
  },

  getChildPages(parentPath) {
    return pageMappingData.filter((page) => {
      const splitUrl = page.url.split('/');
      squeakyClean(splitUrl);
      const iOf = splitUrl.indexOf(parentPath);
      const len = splitUrl.length - 1;
      if (parentPath === '') {
        return len === 0 && !page.url.includes('.html');
      } if (iOf === -1) {
        return false;
      } if (len - iOf === 1) {
        return true;
      }
      return false;
    });
  },

  formattedDate(dateString) {
    const monthName = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    const date = new Date(dateString);
    const month = monthName[date.getMonth()];
    return `${month} ${date.getFullYear()}`;
  },

  noWidows(str) {
    return str.replace(/\s([^\s]+)$/, '&nbsp;$1');
  },

  code(block, locals = { class: '', style: '', language: '' }) {
    // https://github.com/highlightjs/highlight.js/blob/master/SUPPORTED_LANGUAGES.md
    const highlightedCode = (locals.language)
      ? hljs.highlight(block, { language: locals.language }).value
      : hljs.highlightAuto(block).value;
    return `
      <div class="code-container ${locals.class}" style="${locals.style}"><code>${highlightedCode}</code></div>
    `;
  },

  lazyImage(locals) {
    if (!locals.src) {
      throw new Error('lazyImage is missing src attribute');
    }
    const dimensions = sizeOf(path.join(dir.src, locals.src));
    return `<img lazy src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${dimensions.width} ${dimensions.height}'%3E%3C/svg%3E" data-src="${locals.src}" alt="${locals.alt || ''}" height="${dimensions.height}" width="${dimensions.width}" ${locals.class ? `class="${locals.class}"` : ''} />`;
  },

  link(str, locals) {
    if (!locals.href) {
      throw new Error('externalLink is missing href attribute');
    }
    locals.class = `${locals.class || ''} link`;
    return `<a itemprop="url"
    ${Object.keys(locals).map((attr) => `${attr}="${locals[attr]}"`).join(' ')}>${str}</a>`;
  },

  externalLink(str, locals) {
    return this.link(str, merge(locals, { rel: 'noopener', target: '_blank' }));
  },

  defaultLastFMModule: (albums = true) => `
    <span class="item ${albums ? 'album' : 'artist'}">
      <span class="info">
        ${albums ? `
          <span class="name">
            Loading album name
          </span>
        ` : ''}
        <span class="name">
          Loading artist name
        </span>
        <span class="scrobbles">
          Loading scrobbles
        </span>
        <bar style="width: 100%;"></bar>
      </span>
      ${albums ? `
        <span>Loading album cover</span>
      ` : ''}
    </span>`,
});
