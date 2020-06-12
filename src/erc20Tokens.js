import env from './typedEnv'

const addressMap = {
  dai: {
  'rinkeby': '0x4aacB7f0bA0A5CfF9A8a5e8C0F24626Ee9FDA4a6',
  'mainnet': '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
  },
  tether: {
    'rinkeby': '0xF76eB2f15a960A5d96d046a00007EFd737e5ea14',
    'mainnet': '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
  },
  'usd-coin': {
    'rinkeby': '0xF76eB2f15a960A5d96d046a00007EFd737e5ea14',
    'mainnet': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
  },
  'true-usd': {
    'rinkeby': '0x4aacB7f0bA0A5CfF9A8a5e8C0F24626Ee9FDA4a6',
    'mainnet': '0x0000000000085d4780B73119b644AE5ecd22b376'
  }
}

const erc20TokensAddress = {
  dai:
    env.REACT_APP_ENV === 'test' || env.REACT_APP_ENV === 'staging'
      ? addressMap['dai']['rinkeby']
      : addressMap['dai']['mainnet'],
  tether:
    env.REACT_APP_ENV === 'test' || env.REACT_APP_ENV === 'staging'
      ? addressMap['tether']['rinkeby']
      : addressMap['tether']['mainnet'],
  'usd-coin':
    env.REACT_APP_ENV === 'test' || env.REACT_APP_ENV === 'staging'
      ? addressMap['usd-coin']['rinkeby']
      : addressMap['usd-coin']['mainnet'],
  'true-usd':
    env.REACT_APP_ENV === 'test' || env.REACT_APP_ENV === 'staging'
      ? addressMap['true-usd']['rinkeby']
      : addressMap['true-usd']['mainnet'],
}

const erc20TokensList = Object.keys(erc20TokensAddress)
export { erc20TokensAddress, erc20TokensList }
