import EthereumLogo from './images/eth.png'
import BitcoinLogo from './images/btc.png'
import DaiLogo from './images/dai.png'
import LibraLogo from './images/libra.png'

export const cryptoSelections = [
  {
    cryptoType: 'bitcoin',
    title: 'Bitcoin',
    symbol: 'BTC',
    logo: BitcoinLogo,
    decimals: 8,
    txFeesCryptoType: 'bitcoin'
  },
  {
    cryptoType: 'ethereum',
    title: 'Ethereum',
    symbol: 'ETH',
    logo: EthereumLogo,
    decimals: 18,
    txFeesCryptoType: 'ethereum'
  },
  {
    cryptoType: 'dai',
    title: 'Dai',
    symbol: 'DAI',
    logo: DaiLogo,
    address: process.env.REACT_APP_DAI_ADDRESS,
    decimals: 18,
    txFeesCryptoType: 'ethereum'
  },
  {
    cryptoType: 'libra',
    title: 'Libra',
    symbol: 'Libra',
    logo: LibraLogo,
    decimals: 6,
    txFeesCryptoType: 'libra'
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
