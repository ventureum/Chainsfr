module.exports = {
  preset: 'jest-puppeteer',
  testRegex: './*\\.test\\.e2e\\.js$',
  setupTestFrameworkScriptFile: 'expect-puppeteer',
  testEnvironment: "./jest-environment-puppeteer/PuppeteerEnvironment.js"
}
