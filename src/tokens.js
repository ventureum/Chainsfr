import EthereumLogo from './images/eth.png'
import BitcoinLogo from './images/btc.png'
import DaiLogo from './images/dai.png'
import UsdcLogo from './images/usdc.png'
import UsdtLogo from './images/usdt.png'
import TusdLogo from './images/tusd.png'
import { erc20TokensAddress } from './erc20Tokens'

export const cryptoSelections = [
  {
    platformType: 'bitcoin',
    cryptoType: 'bitcoin',
    title: 'Bitcoin',
    symbol: 'BTC',
    logo: BitcoinLogo,
    decimals: 8,
    txFeesCryptoType: 'bitcoin'
  },
  {
    platformType: 'ethereum',
    cryptoType: 'ethereum',
    title: 'Ethereum',
    symbol: 'ETH',
    logo: EthereumLogo,
    decimals: 18,
    txFeesCryptoType: 'ethereum'
  },
  {
    platformType: 'ethereum',
    cryptoType: 'dai',
    title: 'Dai',
    symbol: 'DAI',
    logo: DaiLogo,
    address: erc20TokensAddress.dai,
    decimals: 18,
    txFeesCryptoType: 'ethereum'
  },
  {
    platformType: 'ethereum',
    cryptoType: 'usd-coin',
    title: 'USD Coin',
    symbol: 'USDC',
    logo: UsdcLogo,
    address: erc20TokensAddress['usd-coin'],
    decimals: 6,
    txFeesCryptoType: 'ethereum'
  },
  {
    platformType: 'ethereum',
    cryptoType: 'tether',
    title: 'Tether',
    symbol: 'USDT',
    logo: UsdtLogo,
    address: erc20TokensAddress['tether'],
    decimals: 6,
    txFeesCryptoType: 'ethereum'
  },
  {
    platformType: 'ethereum',
    cryptoType: 'true-usd',
    title: 'TrueUSD',
    symbol: 'TUSD',
    logo: TusdLogo,
    address: erc20TokensAddress['true-usd'],
    decimals: 18,
    txFeesCryptoType: 'ethereum'
  }
]

export function getCryptoTitle (cryptoType) {
  const c = cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
  return c.title
}

export function getCryptoSymbol (cryptoType) {
  const c = cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
  if (c) return c.symbol
  return ''
}

export function getCrypto (cryptoType) {
  return cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
}

export function getCryptoDecimals (cryptoType) {
  const c = cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
  return c.decimals
}

export function getTxFeesCryptoType (cryptoType) {
  const c = cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
  return c.txFeesCryptoType
}

export function getCryptoLogo (cryptoType) {
  const c = cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
  return c.logo
}

export function isERC20 (cryptoType) {
  const c = cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
  return !!c.address
}

export function getCryptoPlatformType (cryptoType) {
  const c = cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
  return c.platformType
}

export function getPlatformCryptos (platformType) {
  const listOfCryptos = cryptoSelections.filter(c => {
    return c.platformType === platformType
  })
  return listOfCryptos
}
