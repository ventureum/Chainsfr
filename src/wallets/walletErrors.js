export default {
  metamask: {
    incorrectNetwork: 'Incorrect MetaMask network',
    extendsionNotFound: 'Check wallet connection failed',
    incorrectAccount: 'MetaMask extendsion holds different account',
    noOptions: 'Options must not be null for metamask wallet',
    authorizationDenied: 'MetaMask wallet authorization denied by user'
  },
  drive: {
    walletNotExist: 'Drive wallet does not exist',
    accountNotExist: 'Account does not exist',
    keyPairDoesNotMatch: 'Invalid Private Key',
    privateKeyNotExist: 'Private key is undefined',
    noOptions: 'Options must not be null for drive wallet'
  },
  escrow: {
    keyPairDoesNotMatch: 'Invalid Private Key',
    privateKeyNotExist: 'Private key is undefined',
    noOptions: 'Options must not be null for escrow wallet',
    noMultiSig: 'MultiSig missing in options',
    noPrivateKeyInAccount: 'PrivateKey does not exist in account'
  },
  ledger: {
    deviceNotConnected: 'Acquire Ledger device connection failed',
    ledgerAppCommunicationFailed: 'Unabled to fetch account from Ledger',
    incorrectAccount: 'Ledger device holds different account',
    contractDataDisabled: 'Please enable Contract data on the Ethereum app Settings'
  },
  metamaskWalletConnect: {
    incorrectAccount: 'MetaMask WalletConnect holds different account',
    noOptions: 'Options must not be null',
    modalClosed: 'User closed WalletConnect modal'
  },
  coinbaseWalletLink: {
    incorrectAccount: 'Coinbase WalletLink holds different account',
    noOptions: 'Options must not be null for coinbase WalletLink wallet',
    authorizationDenied: 'User denied account authorization'
  },
  coinbaseOAuthWallet: {
    accountNotFound: 'Coinbase wallet not found',
    noAddress: 'Unable to obtain wallet address',
    cryptoTypeNotMatched: 'Wrong cryptocurrency type selected'
  }
}
