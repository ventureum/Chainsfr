require('expect-puppeteer')
global.log = require('loglevel')
global.log.setDefaultLevel('info')
jest.setTimeout(900000) // 15 min

// This provides test name to each test
// which can then be logged for debugging
jasmine.getEnv().addReporter({
  specStarted: result => (jasmine.currentTest = result),
  specDone: result => (jasmine.currentTest = result)
})

// dump console error logs to stdio
// make it easier to debug tests
const chalk = require('chalk')
page
  .on('console', message => {
    const type = message
      .type()
      .substr(0, 3)
      .toUpperCase()
    const colors = {
      LOG: text => text,
      ERR: chalk.red,
      WAR: chalk.yellow,
      INF: chalk.cyan
    }
    const color = colors[type] || chalk.blue
    if (type === 'ERR') {
      console.log(color(`${type} ${message.text()}`))
    }
  })
  .on('pageerror', ({ message }) => console.log(chalk.red(message)))
  .on('requestfailed', request =>
    console.log(chalk.magenta(`${request.failure().errorText} ${request.url()}`))
  )
