import EthereumLogo from '../../images/eth.png'
import BitcoinLogo from '../../images/btc.png'
import DaiLogo from '../../images/dai.png'
import UsdcLogo from '../../images/usdc.png'
import UsdtLogo from '../../images/usdt.png'
import TusdLogo from '../../images/tusd.png'

export const DAI_ADDRESS = '0x4aacB7f0bA0A5CfF9A8a5e8C0F24626Ee9FDA4a6'.toLowerCase()
export const INFURA_API_URL = `https://rinkeby.infura.io/v3/${
  process.env.REACT_APP_INFURA_API_KEY
}`

export const cryptoOrder = {
  bitcoin: 100,
  ethereum: 99,
  tether: 0,
  'usd-coin': 97,
  dai: 96,
  'true-usd': 95
}

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
    decimals: 18,
    txFeesCryptoType: 'ethereum'
  },
  {
    platformType: 'ethereum',
    cryptoType: 'usd-coin',
    title: 'USD Coin',
    symbol: 'USDC',
    logo: UsdcLogo,
    decimals: 6,
    txFeesCryptoType: 'ethereum'
  },
  {
    platformType: 'ethereum',
    cryptoType: 'tether',
    title: 'Tether',
    symbol: 'USDT',
    logo: UsdtLogo,
    decimals: 6,
    txFeesCryptoType: 'ethereum'
  },
  {
    platformType: 'ethereum',
    cryptoType: 'true-usd',
    title: 'TrueUSD',
    symbol: 'TUSD',
    logo: TusdLogo,
    decimals: 18,
    txFeesCryptoType: 'ethereum'
  }
]
