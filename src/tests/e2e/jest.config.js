module.exports = {
  preset: 'jest-puppeteer',
  testRegex: './*\\.test\\.e2e\\.js$',
  setupTestFrameworkScriptFile: 'expect-puppeteer',
  testEnvironment: './jest-environment-puppeteer/PuppeteerEnvironment.js',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/mocks/fileMock.js'
  }
}
