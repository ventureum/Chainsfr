// @flow
import MetamaskLogo from './images/metamask-button.png'
import LedgerWalletLogo from './images/ledger-button.png'
import DriveWalletLogo from './images/drive-wallet-button.png'

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
    disabled: false
  },
  {
    walletType: 'ledger',
    title: 'Ledger',
    desc: 'Ledger Hardware Wallet',
    logo: LedgerWalletLogo,
    disabled: false
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
