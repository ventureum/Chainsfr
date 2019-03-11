import MetamaskLogo from './images/metamask-button.svg'
import HardwareWalletLogo from './images/hardware-wallet-button.svg'

export const walletCryptoSupports = {
  'basic': [{ cryptoType: 'ethereum', disabled: true },
    { cryptoType: 'dai', disabled: true },
    { cryptoType: 'bitcoin', disabled: true }],
  'metamask': [{ cryptoType: 'ethereum', disabled: false },
    { cryptoType: 'dai', disabled: false }],
  'ledger': [{ cryptoType: 'ethereum', disabled: false },
    { cryptoType: 'dai', disabled: false },
    { cryptoType: 'bitcoin', disabled: true }]
}

export const walletSelections = [
  {
    walletType: 'basic',
    title: 'Basic',
    desc: 'Use Basic Wallet',
    logo: MetamaskLogo,
    disabled: true
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
    logo: HardwareWalletLogo,
    disabled: false
  }
]
