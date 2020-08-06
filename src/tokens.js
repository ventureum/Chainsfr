import EthereumLogo from './images/eth.png'
import BitcoinLogo from './images/btc.png'
import { store } from './configureStore'

export const cryptoOrder = {
  bitcoin: 100,
  ethereum: 99,
  tether: 0,
  'usd-coin': 97,
  dai: 96,
  'true-usd': 95
}

const getEthContracts = () => store.getState().accountReducer.ethContracts

const cryptoSelections = {
  bitcoin: {
    platformType: 'bitcoin',
    cryptoType: 'bitcoin',
    title: 'Bitcoin',
    symbol: 'BTC',
    logo: BitcoinLogo,
    decimals: 8,
    txFeesCryptoType: 'bitcoin'
  },
  ethereum: {
    platformType: 'ethereum',
    cryptoType: 'ethereum',
    title: 'Ethereum',
    symbol: 'ETH',
    logo: EthereumLogo,
    decimals: 18,
    txFeesCryptoType: 'ethereum'
  }
}

export const defaultEthereumCryptos = ['ethereum', 'dai', 'usd-coin', 'tether', 'true-usd']

export function getCryptoTitle (cryptoType) {
  const ethContracts = getEthContracts()
  return ethContracts[cryptoType]
    ? ethContracts[cryptoType].name
    : cryptoSelections[cryptoType].title
}

export function getCryptoSymbol (cryptoType) {
  const ethContracts = getEthContracts()
  return ethContracts[cryptoType]
    ? ethContracts[cryptoType].symbol
    : cryptoSelections[cryptoType].symbol
}

export function getCrypto (cryptoType) {
  const ethContracts = getEthContracts()
  return ethContracts[cryptoType] || cryptoSelections[cryptoType]
}

export function getCryptoDecimals (cryptoType) {
  const ethContracts = getEthContracts()
  return ethContracts[cryptoType]
    ? ethContracts[cryptoType].decimals
    : cryptoSelections[cryptoType].decimals
}

export function getTxFeesCryptoType (cryptoType) {
  return cryptoType === 'bitcoin' ? 'bitcoin' : 'ethereum'
}

export function getCryptoLogo (cryptoType) {
  const ethContracts = getEthContracts()
  return ethContracts[cryptoType]
    ? ethContracts[cryptoType].logo
    : cryptoSelections[cryptoType].logo
}

export function isERC20 (cryptoType) {
  const ethContracts = getEthContracts()
  return ethContracts[cryptoType] ? ethContracts[cryptoType].erc20 : false
}

export function getCryptoPlatformType (cryptoType) {
  return cryptoType === 'bitcoin' ? 'bitcoin' : 'ethereum'
}

export function getPlatformCryptos (platformType) {
  const listOfCryptos = cryptoSelections.filter(c => {
    return c.platformType === platformType
  })
  return listOfCryptos
}
