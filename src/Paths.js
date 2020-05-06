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

export default process.env.REACT_APP_ENV === 'test' ? testPaths : paths
