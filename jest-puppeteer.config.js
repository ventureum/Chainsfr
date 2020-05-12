// jest-puppeteer.config.js
module.exports = {
  launch: {
    executablePath: process.env.PUPPETEER_EXEC_PATH,
    dumpio: true,
    headless: false,
    /*
      Set the defaultViewport option to null as above to disable the 800x600 resolution. 
      It takes the max resolution then. 
    */
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-web-security', '--disable-gpu', '--disable-setuid-sandbox', '--unlimited-storage', '--disable-dev-shm-usage']
  },
  browser: 'chromium',
  server: process.env.E2E_TEST_START_SERVER === 'true' && {
    command: 'PORT=3001 npm run start:no-hot-load:mock-user',
    usedPortAction: 'kill',
    port: 3001,
    launchTimeout: 180000,
    waitOnScheme: {
      // wait till dev server is started
      // must use http-get since HEAD is not supported in webpack server
      // see https://github.com/smooth-code/jest-puppeteer/issues/338#issuecomment-610831299
      // for reference
      resources: ['http-get://localhost:3001']
    }
  },
}
