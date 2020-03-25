/* eslint-disable no-console */
const {
  setup: setupServer,
  teardown: teardownServer,
  ERROR_TIMEOUT,
  ERROR_NO_COMMAND
} = require('jest-dev-server')
const chalk = require('chalk')
const { readConfig, getPuppeteer } = require('./readConfig')
const path = require('path')

const dappeteer = require('dappeteer')

let browser

let didAlreadyRunInWatchMode = false

async function setup (jestConfig = {}) {
  const config = await readConfig()
  const puppeteer = getPuppeteer(config)

  if (config.connect) {
    browser = await puppeteer.connect(config.connect)
  } else {
    if (process.env.E2E_TEST_METAMASK_PRIVATE_KEY) {
      // setup dappeteer if E2E_TEST_METAMASK_PRIVATE_KEY is set
      browser = await dappeteer.launch(puppeteer, config.launch)

      // after ext installation, we are at ext welcome page
      // must set all metamask configs here before
      // navigating to any other pages
      const metamask = await dappeteer.getMetamask(browser)
      await metamask.importPK(process.env.E2E_TEST_METAMASK_PRIVATE_KEY)
      await metamask.switchNetwork('rinkeby')

      if (config.browserContext === 'incognito') {
        // enable metmask in incognito mode
        //
        // currently, metamask ext popup shows blank page in incognito, thus this part is not being used
        // might be fixed by updating metamask pkg
        //
        // due to the complexity of this part, the following code is reserved for future usage
        //
        // important: the following three steps must be executed in precisely the
        // following order:
        // (setBypassCSP, goto('chrome://extensions/?id=ogegpepdjhlgagkiimnlckeojobdjfgd'), addScriptTag)
        //
        // by pass CSP to avoid 'no inline script' error
        // must be called before navigation
        await page.setBypassCSP(true)
        // the ext url is fixed, so we can safely hard code it here
        await page.goto('chrome://extensions/?id=ogegpepdjhlgagkiimnlckeojobdjfgd')

        // makes the library available in evaluate functions which run within the browser context
        // must be called after navigation since we are evaluating the script on the ext management page
        await page.addScriptTag({
          path: path.join(
            __dirname,
            '../../../../node_modules/query-selector-shadow-dom/dist/querySelectorShadowDom.js'
          )
        })
        
        // the actual btn is in several layers of shadow doms, regular query does not work
        // we must use the package querySelectorShadowDom to search for the entire dom tree
        //
        // find allow-incognito toggle btn and enable it
        const btn = (
          await page.waitForFunction(() => {
            const btn = querySelectorShadowDom.querySelectorDeep('#allow-incognito')
            return btn
          })
        ).asElement()
        await btn.click()
      }
    } else {
      browser = await puppeteer.launch(config.launch)
    }
  }

  process.env.PUPPETEER_WS_ENDPOINT = browser.wsEndpoint()

  // If we are in watch mode, - only setupServer() once.
  if (jestConfig.watch || jestConfig.watchAll) {
    if (didAlreadyRunInWatchMode) return
    didAlreadyRunInWatchMode = true
  }

  if (config.server) {
    try {
      await setupServer(config.server)
    } catch (error) {
      if (error.code === ERROR_TIMEOUT) {
        console.log('')
        console.error(chalk.red(error.message))
        console.error(
          chalk.blue(`\n☝️ You can set "server.launchTimeout" in jest-puppeteer.config.js`)
        )
        process.exit(1)
      }
      if (error.code === ERROR_NO_COMMAND) {
        console.log('')
        console.error(chalk.red(error.message))
        console.error(chalk.blue(`\n☝️ You must set "server.command" in jest-puppeteer.config.js`))
        process.exit(1)
      }
      throw error
    }
  }
}

async function teardown (jestConfig = {}) {
  const config = await readConfig()

  if (config.connect) {
    await browser.disconnect()
  } else {
    await browser.close()
  }

  if (!jestConfig.watch && !jestConfig.watchAll) {
    await teardownServer()
  }
}

module.exports = { setup, teardown }
