export default {
  metamask: {
    incorrectNetwork: 'Incorrect MetaMask network',
    extendsionNotFound: 'Check wallet connection failed',
    incorrectAccount: 'Incorrect MetaMask wallet',
    noOptions: 'Options must not be null for MetaMask wallet',
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
    noPrivateKeyInAccount: 'PrivateKey does not exist'
  },
  ledger: {
    deviceNotConnected: 'Acquire Ledger device connection failed',
    ledgerAppCommunicationFailed: 'Unabled to fetch wallet information from Ledger',
    incorrectAccount: 'Incorrect Ledger wallet',
    contractDataDisabled: 'Please enable Contract data on the Ethereum app Settings',
    incorrectSigningKey:'Ledger App does not have the correct signing keys'
  },
  metamaskWalletConnect: {
    incorrectAccount: 'Incorrect MetaMask Wallet',
    noOptions: 'Options must not be null',
    modalClosed: 'User closed WalletConnect modal'
  },
  coinbaseWalletLink: {
    incorrectAccount: 'Incorrect Coinbase Wallet',
    noOptions: 'Options must not be null for coinbase WalletLink wallet',
    authorizationDenied: 'User denied wallet authorization'
  },
  coinbaseOAuthWallet: {
    accountNotFound: 'Coinbase wallet not found',
    noAddress: 'Unable to obtain wallet address',
    cryptoTypeNotMatched: 'Wrong cryptocurrency type selected',
    popupClosed: 'Popup closed before authorization'
  }
}
