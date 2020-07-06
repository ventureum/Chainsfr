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

const suffix = process.env.REACT_APP_ENV === 'prod' ? '' : 'Demo '

const pathTitle = {
  transfer: `Chainsfr ${suffix}| Send`,
  connections: `Chainsfr ${suffix}| Connections`,
  wallet: `Chainsfr ${suffix}| Wallet`,
  contacts: `Chainsfr ${suffix}| Contacts`,
  userSetting: `Chainsfr ${suffix}| Profile`,
  login: `Chainsfr ${suffix}| Sign in`,
  receipt: `Chainsfr ${suffix}| Receipt`,
  cancel: `Chainsfr ${suffix}| Cancel`,
  referral: `Chainsfr ${suffix}| Referral`,
  OAuthRedirect: `Chainsfr ${suffix}| Redirect`,
  receive: `Chainsfr ${suffix}| Deposit`,
  directTransfer: `Chainsfr ${suffix}| Transfer`,
  default: `Chainsfr ${suffix}`
}

export default (process.env.REACT_APP_ENV === 'test' ? testPaths : paths)
export { pathTitle }
