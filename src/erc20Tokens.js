import env from './typedEnv'

const erc20TokensAddress = {
  dai: env.REACT_APP_DAI_ADDRESS,
  tether:
    env.REACT_APP_ENV === 'test'
      ? env.REACT_APP_DAI_ADDRESS
      : '0xdac17f958d2ee523a2206206994597c13d831ec7',
  'usd-coin':
    env.REACT_APP_ENV === 'test'
      ? env.REACT_APP_DAI_ADDRESS
      : '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  'true-usd':
    env.REACT_APP_ENV === 'test'
      ? env.REACT_APP_DAI_ADDRESS
      : '0x0000000000085d4780B73119b644AE5ecd22b376'
}

const erc20TokensList = Object.keys(erc20TokensAddress)
export { erc20TokensAddress, erc20TokensList }
