const paths = {
  login: '/login',
  home: '/',
  wallet: '/wallet',
  directTransfer: '/directTransfer',
  transfer: '/send',
  receive: '/receive',
  cancel: '/cancel',
  contacts: '/contacts',
  referral: '/referral',
  connections: '/connections',
  receipt: '/receipt',
  OAuthRedirect: '/OAuthRedirect',
  userSetting: '/userSetting'
}

const testPaths = {
  ...paths,
  disconnect: '/disconnect'
}

const pathTitle = {
  transfer: 'Chainsfr | Payments',
  connections: 'Chainsfr | Connections',
  wallet: 'Chainsfr | Wallet',
  contacts: 'Chainsfr | Contacts',
  userSetting: 'Chainsfr | Profile',
  login: 'Chainsfr | Sign in',
  receipt: 'Chainsfr | Receipt',
  default: 'Chainsfr'
}

export default (process.env.REACT_APP_ENV === 'test' ? testPaths : paths)
export { pathTitle }
