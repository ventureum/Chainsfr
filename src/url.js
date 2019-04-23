import env from './typedEnv'

const INFURA_API_URL = `https://${
  env.REACT_APP_ETHEREUM_NETWORK
}.infura.io/v3/${env.REACT_APP_INFURA_API_KEY}`

const LEDGER_API_URL =
  env.REACT_APP_BTC_NETWORK === 'mainnet'
    ? `https://api.ledgerwallet.com/blockchain/v2/btc`
    : `https://api.ledgerwallet.com/blockchain/v2/btc_testnet`

const ETHEREUM_EXPLORER_BASE_URL =
  env.REACT_APP_ETHEREUM_NETWORK === 'mainnet'
    ? `https://etherscan.io/`
    : `https://${env.REACT_APP_ETHEREUM_NETWORK}.etherscan.io/`

const ETHEREUM_EXPLORER_ADDRESS_BASE_URL =
  ETHEREUM_EXPLORER_BASE_URL + 'address/'
const ETHEREUM_EXPLORER_TOKEN_BASE_URL = ETHEREUM_EXPLORER_BASE_URL + 'token/'
const ETHEREUM_EXPLORER_TX_BASE_URL = ETHEREUM_EXPLORER_BASE_URL + 'tx/'

const BITCOIN_EXPLORER_BASE_URL =
  env.REACT_APP_BTC_NETWORK === 'mainnet'
    ? `https://live.blockcypher.com/btc/`
    : `https://live.blockcypher.com/btc-testnet/`

const BITCOIN_EXPLORER_ADDRESS_BASE_URL = BITCOIN_EXPLORER_BASE_URL + 'address/'
const BITCOIN_EXPLORER_TX_BASE_URL = BITCOIN_EXPLORER_BASE_URL + 'tx/'

const BLOCKCYPHER_API_URL =
  env.REACT_APP_BTC_NETWORK === 'mainnet'
    ? 'https://api.blockcypher.com/v1/btc/main'
    : 'https://api.blockcypher.com/v1/btc/test3'

const BTC_FEE_ENDPOINT = 'https://bitcoinfees.earn.com/api/v1/fees/recommended'

function getEthExplorerAddress (address) {
  return ETHEREUM_EXPLORER_ADDRESS_BASE_URL + address
}

function getEthExplorerTx (txHash) {
  return ETHEREUM_EXPLORER_TX_BASE_URL + txHash
}

function getEthExplorerToken (tokenAddress, address) {
  return ETHEREUM_EXPLORER_TOKEN_BASE_URL + tokenAddress + '?a=' + address
}

function getBtcExplorerAddress (address) {
  return BITCOIN_EXPLORER_ADDRESS_BASE_URL + address
}

function getBtcExplorerTx (txHash) {
  return BITCOIN_EXPLORER_TX_BASE_URL + txHash
}

export default {
  BLOCKCYPHER_API_URL,
  INFURA_API_URL,
  LEDGER_API_URL,
  BTC_FEE_ENDPOINT,
  getEthExplorerAddress,
  getEthExplorerToken,
  getEthExplorerTx,
  getBtcExplorerAddress,
  getBtcExplorerTx
}
