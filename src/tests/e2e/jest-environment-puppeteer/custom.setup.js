require('expect-puppeteer')
global.log = require('loglevel')
global.log.setDefaultLevel('info')
jest.setTimeout(900000) // 15 min