// @flow
import MetamaskLogo from './images/metamask-button.png'
import LedgerWalletLogo from './images/ledger-button.png'
import DriveWalletLogo from './images/drive-wallet-button.png'
import { detect } from 'detect-browser'

const browser = detect()

export const walletCryptoSupports = {
  'drive': [{ cryptoType: 'ethereum', disabled: false },
    { cryptoType: 'dai', disabled: false },
    { cryptoType: 'bitcoin', disabled: false }],
  'metamask': [{ cryptoType: 'ethereum', disabled: false },
    { cryptoType: 'dai', disabled: false }],
  'ledger': [{ cryptoType: 'ethereum', disabled: false },
    { cryptoType: 'dai', disabled: false },
    { cryptoType: 'bitcoin', disabled: false }]
}

function browserSupported () {
  if (browser && browser.name === 'chrome') {
    let v = browser.version.split('.')[0]
    if (parseInt(v) >= 73) {
      return true
    }
  }
  return false
}

export const walletSelections = [
  {
    walletType: 'drive',
    title: 'Drive',
    desc: 'Use Drive Wallet',
    logo: DriveWalletLogo,
    disabled: false
  },
  {
    walletType: 'metamask',
    title: 'Metamask',
    desc: 'MetaMask Extension',
    logo: MetamaskLogo,
    disabled: !browserSupported()
  },
  {
    walletType: 'ledger',
    title: 'Ledger',
    desc: 'Ledger Hardware Wallet',
    logo: LedgerWalletLogo,
    disabled: !browserSupported()
  }
]

export function cryptoInWallet (crypto: Object, walletType: string): boolean {
  for (let item of walletCryptoSupports[walletType]) {
    if (item.cryptoType === crypto.cryptoType) return true
  }
  return false
}

export function cryptoDisabled (crypto: Object, walletType: string): boolean {
  for (let item of walletCryptoSupports[walletType]) {
    if (item.cryptoType === crypto.cryptoType && item.disabled) return true
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
