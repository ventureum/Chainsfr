if (!process.env.REACT_APP_E2E_TEST_TEST_MAIL_NAMESPACE)
  throw new Error('REACT_APP_E2E_TEST_TEST_MAIL_NAMESPACE missing')
const testMailNamespace = process.env.REACT_APP_E2E_TEST_TEST_MAIL_NAMESPACE
const suffix = process.env.REACT_APP_E2E_TEST_MAIL_TAG_SUFFIX || ''
const googleId = 116840519665671803638
const email = `${testMailNamespace}.sender${suffix}@inbox.testmail.app`
const name = 'e2e test sender'
const idToken = `mock-${googleId}-${email}-${name}`

const GOOGLE_LOGIN_AUTH_OBJ = {
  googleId: '116840519665671803638',
  tokenObj: {
    token_type: 'Bearer',
    access_token:
      'ya29.a0Adw1xeXjdO0V7FZIogEmF501BSnNYb5aH4DZvBD_7KXSeEZkfn3TJezZy7aPIIGaUnNRXiGrsPnfda9odAKDE2vaE__FKNvddQDl6ECJ-8uMs3HgFgD7l2pPTsQVaNdzsUC37E0qr3aTIh8TcjAK5rqWncdVsfFUCdQ',
    scope:
      'email profile https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email',
    login_hint:
      'AJDLj6LJDpfffkjcFUS7MVJON15C2Dyof6EjrAQH-WGNfxYDgYbFLIEcQ9a17mbruobQU8hpNYntYFjxs_4v15gKtE6K99xq2JGMvVza66OzjGXiVOIJMUg',
    expires_in: 3599,
    id_token: idToken,
    session_state: {
      extraQueryParams: {
        authuser: '2'
      }
    },
    first_issued_at: 1584564119942,
    // 01/01/2100 @ 12:00am (UTC)
    expires_at: 4102444800000,
    idpId: 'google'
  },
  idToken: idToken,
  accessToken:
    'ya29.a0Adw1xeXjdO0V7FZIogEmF501BSnNYb5aH4DZvBD_7KXSeEZkfn3TJezZy7aPIIGaUnNRXiGrsPnfda9odAKDE2vaE__FKNvddQDl6ECJ-8uMs3HgFgD7l2pPTsQVaNdzsUC37E0qr3aTIh8TcjAK5rqWncdVsfFUCdQ',
  profileObj: {
    googleId: googleId,
    imageUrl:
      'https://lh4.googleusercontent.com/-23NNcYMLB9I/AAAAAAAAAAI/AAAAAAAAAAA/AKF05nAyjqK1EWJEGo5qD1lL8s0vZ77hEQ/s96-c/photo.jpg',
    email: email,
    name: name,
    givenName: 'e2e',
    familyName: 'test'
  }
}

const REGISTER_TIME = 1584563835
const MASTER_KEY = 'H@U"Ix[<3E~9xL{%'
const EMAIL = email
const PROFILE = {
  familyName: 'test',
  givenName: 'e2e',
  googleId: googleId,
  imageUrl:
    'https://lh4.googleusercontent.com/-23NNcYMLB9I/AAAAAAAAAAI/AAAAAAAAAAA/AKF05nAyjqK1EWJEGo5qD1lL8s0vZ77hEQ/s96-c/photo.jpg',
  name: name
}

export { GOOGLE_LOGIN_AUTH_OBJ, REGISTER_TIME, MASTER_KEY, EMAIL, PROFILE }
