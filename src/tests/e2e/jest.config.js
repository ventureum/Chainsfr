module.exports = {
  preset: 'jest-puppeteer',
  setupFilesAfterEnv: ['./jest-environment-puppeteer/custom.setup.js'],
  globalSetup: './jest-environment-puppeteer/setup.js',
  globalTeardown: './jest-environment-puppeteer/teardown.js',
  testEnvironment: './jest-environment-puppeteer/PuppeteerEnvironment.js',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/mocks/fileMock.js'
  },
  // TODO: more tests will be added
  testMatch: [
    '**/directTransferWalletAuth.test.e2e.js'
  ]
}
