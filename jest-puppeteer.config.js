// jest-puppeteer.config.js
module.exports = {
  launch: {
    dumpio: true,
    headless: false,
    /*
      Set the defaultViewport option to null as above to disable the 800x600 resolution. 
      It takes the max resolution then. 
    */
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-web-security', '--disable-gpu', '--disable-setuid-sandbox']
  },
  browser: 'chromium',
  browserContext: 'incognito'
}
