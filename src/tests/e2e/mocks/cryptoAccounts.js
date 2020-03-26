const CRYPTO_ACCOUNTS = [
  // cloud wallet's private keys match the keys in mocks/drive.js
  {
    addedAt: 1582577659,
    address: '0xb428Ca537F86a8375fF7FB35d9c58E58Adb85aC8',
    cryptoType: 'ethereum',
    name: 'Ethereum Cloud Wallet',
    updatedAt: 1582577659,
    verified: true,
    walletType: 'drive'
  },
  {
    addedAt: 1582577659,
    address: '0xb428Ca537F86a8375fF7FB35d9c58E58Adb85aC8',
    cryptoType: 'dai',
    name: 'Dai Cloud Wallet',
    updatedAt: 1582577659,
    verified: true,
    walletType: 'drive'
  },
  {
    addedAt: 1582577659,
    cryptoType: 'bitcoin',
    name: 'Bitcoin Cloud Wallet',
    updatedAt: 1582577659,
    verified: true,
    walletType: 'drive',
    xpub:
      'tpubDCJU5Qa4bbLyQH8jteCDJGnTzQSFLpqhCS6v3C3TqXmR3cMGC2Y5BcG6XZ5Sd6ZaJnNszf2kHxAnF3miN63QMLTPhEesVQWaoecbA4qxfCc'
  },
  // metamask
  {
    addedAt: 1583802157,
    address: '0xd3ced3b16c8977ed0e345d162d982b899e978588',
    cryptoType: 'ethereum',
    name: 'Metamask ETH',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'metamask'
  },
  {
    addedAt: 1583802157,
    address: '0xd3ced3b16c8977ed0e345d162d982b899e978588',
    cryptoType: 'dai',
    name: 'Metamask DAI',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'metamask'
  },
  // ledger
  {
    addedAt: 1583802157,
    address: '0xd3ced3b16c8977ed0e345d162d982b899e978588',
    cryptoType: 'ethereum',
    name: 'Ledger ETH',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'ledger'
  },
  {
    addedAt: 1583802157,
    address: '0xd3ced3b16c8977ed0e345d162d982b899e978588',
    cryptoType: 'dai',
    name: 'Ledger DAI',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'ledger'
  },
  {
    addedAt: 1582577659,
    cryptoType: 'bitcoin',
    name: 'Ledger BTC',
    updatedAt: 1582577659,
    verified: true,
    walletType: 'ledger',
    xpub:
      'tpubDCJU5Qa4bbLyQH8jteCDJGnTzQSFLpqhCS6v3C3TqXmR3cMGC2Y5BcG6XZ5Sd6ZaJnNszf2kHxAnF3miN63QMLTPhEesVQWaoecbA4qxfCc'
  },
  // coinbaseWalletLink
  {
    addedAt: 1583802157,
    address: '0xd3ced3b16c8977ed0e345d162d982b899e978588',
    cryptoType: 'ethereum',
    name: 'CoinbaseWalletLink ETH',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'coinbaseWalletLink'
  },
  {
    addedAt: 1583802157,
    address: '0xd3ced3b16c8977ed0e345d162d982b899e978588',
    cryptoType: 'dai',
    name: 'CoinbaseWalletLink DAI',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'coinbaseWalletLink'
  },
  // metamaskWalletConnect
  {
    addedAt: 1583802157,
    address: '0xd3ced3b16c8977ed0e345d162d982b899e978588',
    cryptoType: 'ethereum',
    name: 'MetamaskWalletConnect ETH',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'metamaskWalletConnect'
  },
  {
    addedAt: 1583802157,
    address: '0xd3ced3b16c8977ed0e345d162d982b899e978588',
    cryptoType: 'dai',
    name: 'MetamaskWalletConnect DAI',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'metamaskWalletConnect'
  },
  // trustWalletConnect
  {
    addedAt: 1583802157,
    address: '0xd3ced3b16c8977ed0e345d162d982b899e978588',
    cryptoType: 'ethereum',
    name: 'TrustWalletConnect ETH',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'trustWalletConnect'
  },
  {
    addedAt: 1583802157,
    address: '0xd3ced3b16c8977ed0e345d162d982b899e978588',
    cryptoType: 'dai',
    name: 'TrustWalletConnect DAI',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'trustWalletConnect'
  },
  // coinbase oauth
  {
    addedAt: 1584480506,
    address: '0x55985F5C5cc9cC1A4263feb11AB5a1d6CbEf3bBA',
    cryptoType: 'ethereum',
    email: 'e2e-user@gmail.com',
    name: 'e2e-user@gmail.com',
    updatedAt: 1584480506,
    verified: true,
    walletType: 'coinbaseOAuthWallet'
  },
  {
    addedAt: 1583369082,
    address: '1B4sx7VFSd9gfc2P2as4fqPkS94VVqTfjZ',
    cryptoType: 'bitcoin',
    email: 'e2e-user@gmail.com',
    name: 'e2e-user@gmail.com',
    updatedAt: 1583369082,
    verified: true,
    walletType: 'coinbaseOAuthWallet'
  }
]

export { CRYPTO_ACCOUNTS }