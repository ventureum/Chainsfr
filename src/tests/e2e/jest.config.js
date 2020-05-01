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
    //'**/emailTransferForm.test.e2e.js',
    //'**/emailTransferFormEntryPoint.test.e2e.js',
    //'**/emailTransferReview.test.e2e.js',
    //'**/directTransferForm.test.e2e.js',
    //'**/directTransferReview.test.e2e.js',
    '**/accountManagement.test.e2e.js',
    '**/emailTransferWalletAuth.test.e2e.js',
    '**/cancelTransfer.test.e2e.js',
    '**/receiveTransfer.test.e2e.js',
    '**/landing.test.e2e.js',
    '**/receipt.test.e2e.js',
    '**/recipients.test.e2e.js',
    '**/userSetting.test.e2e.js'
  ]
}
