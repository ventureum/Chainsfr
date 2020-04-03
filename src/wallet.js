// @flow
import MetamaskExtensionLogo from './images/metamask-chrome.svg'
import MetamaskMobileLogo from './images/metamask-mobile.svg'
import MetamaskLogo from './images/metamask.svg'
import LedgerWalletLogo from './images/ledger-button.png'
import DriveWalletLogo from './images/drive-wallet-button.svg'
import CoinbaseWalletLinkLogo from './images/coinbase-walletLink.png'
import CoinbaseWalletLogo from './images/coinbase.png'
import TrustWalletLogo from './images/trust-wallet.png'
import { detect } from 'detect-browser'
import { isMobile } from 'react-device-detect'

const browser = detect()

export const walletCryptoSupports = {
  drive: [
    { cryptoType: 'ethereum', disabled: false, platformType: 'ethereum' },
    { cryptoType: 'dai', disabled: false, platformType: 'ethereum' },
    { cryptoType: 'bitcoin', disabled: false, platformType: 'bitcoin' }
  ],
  metamask: [
    { cryptoType: 'ethereum', disabled: false, platformType: 'ethereum' },
    { cryptoType: 'dai', disabled: false, platformType: 'ethereum' }
  ],
  ledger: [
    { cryptoType: 'ethereum', disabled: false, platformType: 'ethereum' },
    { cryptoType: 'dai', disabled: false, platformType: 'ethereum' },
    { cryptoType: 'bitcoin', disabled: false, platformType: 'bitcoin' }
  ],
  coinbaseWalletLink: [{ cryptoType: 'ethereum', disabled: false, platformType: 'ethereum' }],
  metamaskWalletConnect: [
    { cryptoType: 'ethereum', disabled: false, platformType: 'ethereum' },
    { cryptoType: 'dai', disabled: false, platformType: 'ethereum' }
  ],
  trustWalletConnect: [
    { cryptoType: 'ethereum', disabled: false, platformType: 'ethereum' },
    { cryptoType: 'dai', disabled: false, platformType: 'ethereum' }
  ],
  coinomiWalletConnect: [
    { cryptoType: 'ethereum', disabled: false, platformType: 'ethereum' },
    { cryptoType: 'dai', disabled: false, platformType: 'ethereum' }
  ],
  referralWallet: [{ cryptoType: 'ethereum', disabled: false, platformType: 'ethereum' }],
  coinbaseOAuthWallet: [
    { cryptoType: 'ethereum', disabled: false, platformType: 'ethereum' },
    { cryptoType: 'dai', disabled: false, platformType: 'ethereum' },
    { cryptoType: 'bitcoin', disabled: false, platformType: 'bitcoin' }
  ]
}

function isBrowserCompatible ({ status, walletType }: { status: Object, walletType: string }) {
  if (browser && browser.name === 'chrome') {
    let v = browser.version.split('.')[0]
    if (parseInt(v) < 73) {
      status.sendable = false
      status.receivable = false
      status.addable = false
      status.disabledReason = 'Chrome version 73 or above needed'
    }
  } else if (browser && !['chrome', 'ios', 'crios'].includes(browser.name)) {
    status.sendable = false
    status.receivable = false
    status.addable = false
    status.disabledReason = 'Browser is not supported'
  }

  return { status, walletType }
}

function isSendable ({ status, walletType }: { status: Object, walletType: string }) {
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
    status.sendable = false
    status.disabledReason = status.disabledReason || 'Not supported in mobile device'
  }
  if (walletType === 'coinbaseOAuthWallet') {
    status.sendable = false
    status.disabledReason = status.disabledReason || 'Send from coinbase wallet not supported'
  }
  return { status, walletType }
}

function isReceivable ({ status, walletType }: { status: Object, walletType: string }) {
  // enable receive for all regular wallets by default
  if (['escrow', 'referralWallet'].includes(walletType)) {
    status.receivable = false
  }

  return { status, walletType }
}

function isAddable ({ status, walletType }: { status: Object, walletType: string }) {
  // in mobile, only coinbaseOauthWallet is enabled
  if (isMobile && walletType !== 'coinbaseOAuthWallet') {
    status.addable = false
    status.disabledReason = status.disabledReason || 'Not supported in mobile device'
  }

  if (['drive', 'metamaskOne', 'referralWallet', 'escrow'].includes(walletType)) {
    status.addable = false
  }

  return { status, walletType }
}

export function getWalletStatus (walletType: string) {
  const compose = (...args) => value => args.reduceRight((acc, fn) => fn(acc), value)
  const status = {
    sendable: true,
    receivable: true,
    addable: true
  }

  // compose from right to left
  return compose(isAddable, isReceivable, isSendable, isBrowserCompatible)({ status, walletType })
    .status
}

export const walletSelections = [
  {
    walletType: 'drive',
    title: 'Chainsfr',
    desc: 'Use Chainsfr Wallet',
    logo: DriveWalletLogo,
    ...getWalletStatus('drive'),
    disabled: false,
    hide: false,
    displayInHome: true
  },
  {
    walletType: 'coinbaseWalletLink',
    title: 'Coinbase Wallet',
    desc: 'Coinbase Wallet',
    logo: CoinbaseWalletLinkLogo,
    ...getWalletStatus('coinbaseWalletLink'),
    disabled: false,
    hide: false,
    displayInHome: true
  },
  {
    // original metamask icon
    // only displyed on landing page
    walletType: 'metamaskOne',
    title: 'Metamask',
    desc: 'MetaMask One',
    logo: MetamaskLogo,
    ...getWalletStatus('metamaskOne'),
    hide: false,
    displayInHome: true
  },
  {
    walletType: 'metamask',
    title: 'Metamask',
    desc: 'MetaMask Extension',
    logo: MetamaskExtensionLogo,
    ...getWalletStatus('metamask'),
    hide: false,
    displayInHome: false
  },
  {
    walletType: 'ledger',
    title: 'Ledger',
    desc: 'Ledger Hardware Wallet',
    logo: LedgerWalletLogo,
    ...getWalletStatus('ledger'),
    hide: false,
    displayInHome: true
  },
  {
    walletType: 'metamaskWalletConnect',
    title: 'MetaMask Mobile',
    desc: 'MetaMask Mobile',
    logo: MetamaskMobileLogo,
    ...getWalletStatus('metamaskWalletConnect'),
    disabled: false,
    hide: false,
    displayInHome: false
  },
  {
    walletType: 'referralWallet',
    title: 'Referral Wallet',
    desc: 'Referral Wallet',
    logo: DriveWalletLogo,
    ...getWalletStatus('referralWallet'),
    disabled: false,
    hide: true,
    displayInHome: false
  },
  {
    walletType: 'escrow',
    title: 'Escrow Wallet',
    desc: 'Escrow Wallet',
    logo: DriveWalletLogo,
    ...getWalletStatus('escrow'),
    disabled: false,
    hide: true,
    displayInHome: false
  },
  {
    walletType: 'trustWalletConnect',
    title: 'Trust Wallet',
    desc: 'Trust Wallet',
    logo: TrustWalletLogo,
    ...getWalletStatus('trustWalletConnect'),
    disabled: false,
    hide: false,
    displayInHome: true
  },
  {
    walletType: 'coinbaseOAuthWallet',
    title: 'Coinbase',
    desc: 'Coinbase',
    logo: CoinbaseWalletLogo,
    ...getWalletStatus('coinbaseOAuthWallet'),
    disabled: false,
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

export function getWalletConfig (walletType: string): Object {
  const w: Object = walletSelections.find(wallet => {
    return walletType === wallet.walletType
  })
  return w
}

export function getWalletDescText (walletType: string): Object {
  const w: Object = walletSelections.find(wallet => {
    return walletType === wallet.walletType
  })
  return w.desc
}

export function getWalletSupportedPlatforms (walletType: string): Array<string> {
  let supported = {}
  let listOfCryptos = walletCryptoSupports[walletType]
  listOfCryptos.forEach(crypto => {
    supported[crypto.platformType] = true
  })
  return Object.keys(supported)
}
