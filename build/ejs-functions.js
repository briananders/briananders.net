const ejs = require('ejs');
const fs = require('fs');

module.exports = {

  partial(path, data) {
    const newPath = `${__dirname}/../src/partials/${path}.ejs`;

    return ejs.render(fs.readFileSync(newPath).toString(), data, {
      compileDebug: true,
    });
  },

};
