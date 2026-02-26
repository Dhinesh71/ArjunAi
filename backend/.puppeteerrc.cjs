const { join } = require('path');

module.exports = {
    // Forces Puppeteer to download and look for Chrome in a local .cache folder
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
