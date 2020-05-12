const CRYPTO_ACCOUNTS = [
  // cloud wallet's private keys match the keys in mocks/drive.js
  {
    addedAt: 1582577659,
    address: '0x259EC51eFaA03c33787752E5a99BeCBF7F8526c4',
    cryptoType: 'ethereum',
    name: 'Ethereum Cloud Wallet',
    updatedAt: 1582577659,
    verified: true,
    walletType: 'drive'
  },
  {
    addedAt: 1582577659,
    address: '0x259EC51eFaA03c33787752E5a99BeCBF7F8526c4',
    cryptoType: 'dai',
    name: 'Dai Cloud Wallet',
    updatedAt: 1582577659,
    verified: true,
    walletType: 'drive'
  },
  {
    addedAt: 1583802157,
    address: '0x259EC51eFaA03c33787752E5a99BeCBF7F8526c4',
    cryptoType: 'usd-coin',
    name: 'USDC Cloud Wallet',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'drive'
  },
  {
    addedAt: 1583802157,
    address: '0x259EC51eFaA03c33787752E5a99BeCBF7F8526c4',
    cryptoType: 'tether',
    name: 'Tether Cloud Wallet',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'drive'
  },
  {
    addedAt: 1583802157,
    address: '0x259EC51eFaA03c33787752E5a99BeCBF7F8526c4',
    cryptoType: 'true-usd',
    name: 'TUSD Cloud Wallet',
    updatedAt: 1583802157,
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
      'tpubDCGHKimikfN7inXVgFiRJiAkN3Lb2Rca1UQyfnioyAJDQX7SkqD8dnYJH6SdjUcMkpNFNTHxwNYoCbna2CL9ZrYCZgKgv84hvHVrNEMLHME'
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
  {
    addedAt: 1583802157,
    address: '0xd3ced3b16c8977ed0e345d162d982b899e978588',
    cryptoType: 'usd-coin',
    name: 'Metamask USDC',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'metamask'
  },
  {
    addedAt: 1583802157,
    address: '0xd3ced3b16c8977ed0e345d162d982b899e978588',
    cryptoType: 'tether',
    name: 'Metamask Tether',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'metamask'
  },
  {
    addedAt: 1583802157,
    address: '0xd3ced3b16c8977ed0e345d162d982b899e978588',
    cryptoType: 'true-usd',
    name: 'Metamask TUSD',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'metamask'
  },
  // ledger
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'ethereum',
    name: 'Ledger ETH',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'ledger'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'dai',
    name: 'Ledger DAI',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'ledger'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'usd-coin',
    name: 'Ledger USDC',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'ledger'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'tether',
    name: 'Ledger Tether',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'ledger'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'true-usd',
    name: 'Ledger TUSD',
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
      'tpubDCGHKimikfN7inXVgFiRJiAkN3Lb2Rca1UQyfnioyAJDQX7SkqD8dnYJH6SdjUcMkpNFNTHxwNYoCbna2CL9ZrYCZgKgv84hvHVrNEMLHME'
  },
  // coinbaseWalletLink
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'ethereum',
    name: 'CoinbaseWalletLink ETH',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'coinbaseWalletLink'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'dai',
    name: 'CoinbaseWalletLink DAI',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'coinbaseWalletLink'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'usd-coin',
    name: 'CoinbaseWalletLink USDC',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'coinbaseWalletLink'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'tether',
    name: 'CoinbaseWalletLink Tether',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'coinbaseWalletLink'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'true-usd',
    name: 'CoinbaseWalletLink TUSD',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'coinbaseWalletLink'
  },
  // metamaskWalletConnect
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'ethereum',
    name: 'MetamaskWalletConnect ETH',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'metamaskWalletConnect'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'dai',
    name: 'MetamaskWalletConnect DAI',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'metamaskWalletConnect'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'usd-coin',
    name: 'MetamaskWalletConnect USDC',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'metamaskWalletConnect'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'tether',
    name: 'MetamaskWalletConnect Tether',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'metamaskWalletConnect'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'true-usd',
    name: 'MetamaskWalletConnect TUSD',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'metamaskWalletConnect'
  },
  // trustWalletConnect
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'ethereum',
    name: 'TrustWalletConnect ETH',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'trustWalletConnect'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'dai',
    name: 'TrustWalletConnect DAI',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'trustWalletConnect'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'usd-coin',
    name: 'TrustWalletConnect USDC',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'trustWalletConnect'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'tether',
    name: 'TrustWalletConnect Tether',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'trustWalletConnect'
  },
  {
    addedAt: 1583802157,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
    cryptoType: 'true-usd',
    name: 'TrustWalletConnect TUSD',
    updatedAt: 1583802157,
    verified: true,
    walletType: 'trustWalletConnect'
  },
  // coinbase oauth
  {
    addedAt: 1584480506,
    address: '0x6F6a68eC176AAfFE76e6771F2Ea79607f6B79801',
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


