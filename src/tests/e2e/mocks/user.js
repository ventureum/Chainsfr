if (!process.env.REACT_APP_E2E_TEST_TEST_MAIL_NAMESPACE)
  throw new Error('REACT_APP_E2E_TEST_TEST_MAIL_NAMESPACE missing')
const testMailNamespace = process.env.REACT_APP_E2E_TEST_TEST_MAIL_NAMESPACE

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
    id_token:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6ImE1NDFkNmVmMDIyZDc3YTIzMThmN2RkNjU3ZjI3NzkzMjAzYmVkNGEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNzU0NjM2NzUyODExLWo3MTIzdHMxM2p0M21uanQ5YmdlZTcxMDFqcTRuZGZ1LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNzU0NjM2NzUyODExLWo3MTIzdHMxM2p0M21uanQ5YmdlZTcxMDFqcTRuZGZ1LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE2ODQwNTE5NjY1NjcxODAzNjM4IiwiZW1haWwiOiJjaGFpbnNmcmUyZXRlc3RAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJsNjRVeThQc0M4RnMwc2FSYXN3Q3RnIiwibmFtZSI6ImUyZSB0ZXN0IiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tMjNOTmNZTUxCOUkvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQUtGMDVuQXlqcUsxRVdKRUdvNXFEMWxMOHMwdlo3N2hFUS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiZTJlIiwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwibG9jYWxlIjoiZW4iLCJpYXQiOjE1ODQ1NjQxMTksImV4cCI6MTU4NDU2NzcxOSwianRpIjoiZjk4MWJkODhmMGMxMTYxNWI0MzRjMWZjNWRiODA4NDFiYTA5MDM0MSJ9.hGN21PrSowMEj_gwJNJkNGlRJGEeiYIGzKBCHbG1KVKb_8Qu8WDZSUZ3d8GJNfeepvZDrEgJOpd4sNcWwu_Pztf9lvOYcf3gydxckFkZyQMq2J5tmoNO2ZXpBud7r37FCCDNLpelGxAYa_MXv2qOnriOj8dVKE5l1HhKzd_mgtJAoDiX6P3EY_6WDjz4IIsU1iUuRB91gMH_S0pEtwpjXQzuF1AGSbHZIHqNtY-_mmmyMIXmGG0sBe4oGDSo3DCEUnS0Yp5IJ_j92Fxaj7cHsBkEdwBOoduMJGCZdhVislt3XyBbjMNlajrsyF6mssHNXVBU1JWorc7P6Z-_Zy5oyw',
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
  idToken:
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImE1NDFkNmVmMDIyZDc3YTIzMThmN2RkNjU3ZjI3NzkzMjAzYmVkNGEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNzU0NjM2NzUyODExLWo3MTIzdHMxM2p0M21uanQ5YmdlZTcxMDFqcTRuZGZ1LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNzU0NjM2NzUyODExLWo3MTIzdHMxM2p0M21uanQ5YmdlZTcxMDFqcTRuZGZ1LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE2ODQwNTE5NjY1NjcxODAzNjM4IiwiZW1haWwiOiJjaGFpbnNmcmUyZXRlc3RAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJsNjRVeThQc0M4RnMwc2FSYXN3Q3RnIiwibmFtZSI6ImUyZSB0ZXN0IiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tMjNOTmNZTUxCOUkvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQUtGMDVuQXlqcUsxRVdKRUdvNXFEMWxMOHMwdlo3N2hFUS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiZTJlIiwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwibG9jYWxlIjoiZW4iLCJpYXQiOjE1ODQ1NjQxMTksImV4cCI6MTU4NDU2NzcxOSwianRpIjoiZjk4MWJkODhmMGMxMTYxNWI0MzRjMWZjNWRiODA4NDFiYTA5MDM0MSJ9.hGN21PrSowMEj_gwJNJkNGlRJGEeiYIGzKBCHbG1KVKb_8Qu8WDZSUZ3d8GJNfeepvZDrEgJOpd4sNcWwu_Pztf9lvOYcf3gydxckFkZyQMq2J5tmoNO2ZXpBud7r37FCCDNLpelGxAYa_MXv2qOnriOj8dVKE5l1HhKzd_mgtJAoDiX6P3EY_6WDjz4IIsU1iUuRB91gMH_S0pEtwpjXQzuF1AGSbHZIHqNtY-_mmmyMIXmGG0sBe4oGDSo3DCEUnS0Yp5IJ_j92Fxaj7cHsBkEdwBOoduMJGCZdhVislt3XyBbjMNlajrsyF6mssHNXVBU1JWorc7P6Z-_Zy5oyw',
  accessToken:
    'ya29.a0Adw1xeXjdO0V7FZIogEmF501BSnNYb5aH4DZvBD_7KXSeEZkfn3TJezZy7aPIIGaUnNRXiGrsPnfda9odAKDE2vaE__FKNvddQDl6ECJ-8uMs3HgFgD7l2pPTsQVaNdzsUC37E0qr3aTIh8TcjAK5rqWncdVsfFUCdQ',
  profileObj: {
    googleId: '116840519665671803638',
    imageUrl:
      'https://lh4.googleusercontent.com/-23NNcYMLB9I/AAAAAAAAAAI/AAAAAAAAAAA/AKF05nAyjqK1EWJEGo5qD1lL8s0vZ77hEQ/s96-c/photo.jpg',
    email: `${testMailNamespace}.sender@inbox.testmail.app`,
    name: 'e2e test sender',
    givenName: 'e2e',
    familyName: 'test'
  }
}

const REGISTER_TIME = 1584563835
const MASTER_KEY = 'H@U"Ix[<3E~9xL{%'
const EMAIL = `${testMailNamespace}.sender@inbox.testmail.app`
const PROFILE = {
  familyName: 'test',
  givenName: 'e2e',
  googleId: '116840519665671803638',
  imageUrl:
    'https://lh4.googleusercontent.com/-23NNcYMLB9I/AAAAAAAAAAI/AAAAAAAAAAA/AKF05nAyjqK1EWJEGo5qD1lL8s0vZ77hEQ/s96-c/photo.jpg',
  name: 'e2e test sender'
}

export { GOOGLE_LOGIN_AUTH_OBJ, REGISTER_TIME, MASTER_KEY, EMAIL, PROFILE }
