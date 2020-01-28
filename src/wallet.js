// @flow
import MetamaskExtensionLogo from './images/metamask-chrome.svg'
import MetamaskMobileLogo from './images/metamask-mobile.svg'
import MetamaskLogo from './images/metamask.svg'
import LedgerWalletLogo from './images/ledger-button.png'
import DriveWalletLogo from './images/drive-wallet-button.png'
import CoinbaseWalletLinkLogo from './images/coinbase-walletLink.png'
import CoinbaseWalletLogo from  './images/coinbase.png'
import TrustWalletLogo from './images/trust-wallet.png'
import { detect } from 'detect-browser'
import { isMobile } from 'react-device-detect'

const browser = detect()

export const walletCryptoSupports = {
  drive: [
    { cryptoType: 'ethereum', disabled: false },
    { cryptoType: 'dai', disabled: false },
    { cryptoType: 'bitcoin', disabled: false }
  ],
  metamask: [
    { cryptoType: 'ethereum', disabled: false },
    { cryptoType: 'dai', disabled: false }
  ],
  ledger: [
    { cryptoType: 'ethereum', disabled: false },
    { cryptoType: 'dai', disabled: false },
    { cryptoType: 'bitcoin', disabled: false }
  ],
  coinbaseWalletLink: [{ cryptoType: 'ethereum', disabled: false }],
  metamaskWalletConnect: [
    { cryptoType: 'ethereum', disabled: false },
    { cryptoType: 'dai', disabled: false }
  ],
  trustWalletConnect: [
    { cryptoType: 'ethereum', disabled: false },
    { cryptoType: 'dai', disabled: false }
  ],
  coinomiWalletConnect: [
    { cryptoType: 'ethereum', disabled: false },
    { cryptoType: 'dai', disabled: false }
  ],
  referralWallet: [{ cryptoType: 'ethereum', disabled: false }],
  coinbaseOAuthWallet: [
    { cryptoType: 'ethereum', disabled: false },
    { cryptoType: 'bitcoin', disabled: false }
  ]
}

export function getWalletStatus (walletType: ?string) {
  if (
    isMobile &&
    [
      'metamask',
      'metamaskOne',
      'metamaskWalletConnect',
      'trustWalletConnect',
      'coinbaseOAuthWallet',
      'ledger',
      'coinbaseWalletLink'
    ].includes(walletType)
  ) {
    return {
      disabled: true,
      disabledReason: 'Not supported in mobile device'
    }
  } else if (browser && browser.name === 'chrome') {
    let v = browser.version.split('.')[0]
    if (parseInt(v) < 73) {
      return {
        disabled: true,
        disabledReason: 'Chrome version 73 or above needed'
      }
    }
  } else if (browser && browser.name !== 'chrome') {
    return {
      disabled: true,
      disabledReason: 'Chrome browser needed'
    }
  }
  return {
    disabled: false,
    disabledReason: ''
  }
}

export const walletSelections = [
  {
    walletType: 'drive',
    title: 'Chainsfr Wallet',
    desc: 'Use Chainsfr Wallet',
    logo: DriveWalletLogo,
    disabled: false,
    sendable: true,
    receivable: true,
    hide: false,
    displayInHome: true
  },
  {
    walletType: 'coinbaseWalletLink',
    title: 'Coinbase Wallet',
    desc: 'Coinbase Wallet',
    logo: CoinbaseWalletLinkLogo,
    disabled: false,
    sendable: true,
    receivable: true,
    hide: false,
    displayInHome: true
  },
  {
    walletType: 'metamaskOne',
    title: 'Metamask',
    desc: 'MetaMask One',
    logo: MetamaskLogo,
    ...getWalletStatus(),
    sendable: true,
    receivable: false,
    hide: false,
    displayInHome: true
  },
  {
    walletType: 'metamask',
    title: 'Metamask',
    desc: 'MetaMask Extension',
    logo: MetamaskExtensionLogo,
    ...getWalletStatus(),
    sendable: true,
    receivable: true,
    hide: false,
    displayInHome: false
  },
  {
    walletType: 'ledger',
    title: 'Ledger',
    desc: 'Ledger Hardware Wallet',
    logo: LedgerWalletLogo,
    ...getWalletStatus(),
    sendable: true,
    receivable: true,
    hide: false,
    displayInHome: true
  },
  {
    walletType: 'metamaskWalletConnect',
    title: 'MetaMask Mobile',
    desc: 'MetaMask Mobile',
    logo: MetamaskMobileLogo,
    disabled: false,
    sendable: true,
    receivable: true,
    hide: false,
    displayInHome: false
  },
  {
    walletType: 'referralWallet',
    title: 'Referral Wallet',
    desc: 'Referral Wallet',
    logo: DriveWalletLogo,
    disabled: false,
    sendable: true,
    receivable: false,
    hide: true,
    displayInHome: false
  },
  {
    walletType: 'escrow',
    title: 'Escrow Wallet',
    desc: 'Escrow Wallet',
    logo: DriveWalletLogo,
    disabled: false,
    sendable: true,
    receivable: true,
    hide: true,
    displayInHome: false
  },
  {
    walletType: 'trustWalletConnect',
    title: 'Trust Wallet',
    desc: 'Trust Wallet',
    logo: TrustWalletLogo,
    disabled: false,
    sendable: true,
    receivable: true,
    hide: false,
    displayInHome: true
  },
  {
    walletType: 'coinbaseOAuthWallet',
    title: 'Coinbase',
    desc: 'Coinbase',
    logo: CoinbaseWalletLogo,
    disabled: false,
    sendable: false,
    receivable: true,
    hide: false,
    displayInHome: false
  }
  /*
  {
    walletType: 'coinomiWalletConnect',
    title: 'Coinomi',
    desc: 'Coinomi',
    logo: CoinomiWalletLogo,
    disabled: false
  }, */
]

export function cryptoInWallet (cryptoType: string, walletType: string): boolean {
  for (let item of walletCryptoSupports[walletType]) {
    if (item.cryptoType === cryptoType) return true
  }
  return false
}

export function cryptoDisabled (cryptoType: string, walletType: string): boolean {
  for (let item of walletCryptoSupports[walletType]) {
    if (item.cryptoType === cryptoType && item.disabled) return true
  }
  return false
}

export function walletDisabledByCrypto (walletType: string, cryptoType: string): boolean {
  return !walletCryptoSupports[walletType].find(element => {
    return element.cryptoType === cryptoType
  })
}

export function getWalletTitle (walletType: string): string {
  const w: Object = walletSelections.find(wallet => {
    return walletType === wallet.walletType
  })
  return w.title
}

export function getWalletLogo (walletType: string): Object {
  const w: Object = walletSelections.find(wallet => {
    return walletType === wallet.walletType
  })
  return w.logo
}
