import ReactGA from 'react-ga'
import isPromise from 'is-promise'
import env from './typedEnv'
import moment from 'moment'

const options = {}
const GA_ENABLED = !!env.REACT_APP_GA_TRACKING_ID

if (!window.Intercom && env.REACT_APP_INTERCOM_APP_ID) {
  ;(function () {
    var w = window
    var ic = w.Intercom
    if (typeof ic === 'function') {
      ic('reattach_activator')
      ic('update', w.intercomSettings)
    } else {
      var d = document
      var i = function () {
        i.c(arguments)
      }
      i.q = []
      i.c = function (args) {
        i.q.push(args)
      }
      w.Intercom = i
      var l = function () {
        var s = d.createElement('script')
        s.type = 'text/javascript'
        s.async = true
        s.src = `https://widget.intercom.io/widget/${env.REACT_APP_INTERCOM_APP_ID}`
        var x = d.getElementsByTagName('script')[0]
        x.parentNode.insertBefore(s, x)
      }
      if (w.attachEvent) {
        w.attachEvent('onload', l)
      } else {
        w.addEventListener('load', l, false)
      }
    }
  })()
}

export const initTracker = () => {
  // init GA
  if (!GA_ENABLED) return
  ReactGA.initialize(env.REACT_APP_GA_TRACKING_ID, { debug: env.REACT_APP_ENV === 'test' })
}

export const trackPage = page => {
  if (!GA_ENABLED) return
  ReactGA.set({
    page,
    ...options
  })
  ReactGA.pageview(page)
}

export const trackGAEvent = ({ category, action, label, value }) => {
  if (!GA_ENABLED) return
  ReactGA.event({
    category: category,
    action: action,
    label: label instanceof Object ? JSON.stringify(label) : label,
    value: value
  })
}

export const trackIntercomEvent = ({ eventName, meta }) => {
  if (window.Intercom) {
    window.Intercom('trackEvent', eventName, meta)
  }
}

export const trackUser = userId => {
  if (!GA_ENABLED) return
  ReactGA.set({ userId })
}

export const trackException = ({ description, fatal = true }) => {
  if (!GA_ENABLED) return
  ReactGA.exception({
    description,
    fatal
  })
}

// whitelist based on action type regex
const ACTION_WHITELIST = [
  // userActions
  /REGISTER_FULFILLED/,
  /POST_LOGIN_PREPARATION_FULFILLED/,
  /LOGOUT_FULFILLED/,
  /ADD_RECIPIENT_FULFILLED/,
  /EDIT_RECIPIENT_FULFILLED/,
  /REMOVE_RECIPIENT_FULFILLED/,
  // accountActions
  /ADD_CRYPTO_ACCOUNTS_FULFILLED/,
  /REMOVE_CRYPTO_ACCOUNTS_FULFILLED/,
  /MODIFY_CRYPTO_ACCOUNTS_NAME_FULFILLED/,
  // walletActions
  /CREATE_CLOUD_WALLET_FULFILLED/,
  /CHANGE_CHAINSFR_WALLET_PASSWORD_FULFILLED/,
  /VERIFY_ACCOUNT_FULFILLED/,
  /CHECK_WALLET_CONNECTION_FULFILLED/,
  /NEW_CRYPTO_ACCOUNTS_FROM_WALLET_FULFILLED/,
  // transferActions
  /DIRECT_TRANSFER_FULFILLED/,
  /SUBMIT_TX_FULFILLED/,
  /ACCEPT_TRANSFER_FULFILLED/,
  /CANCEL_TRANSFER_FULFILLED/,
  /SET_TOKEN_ALLOWANCE_FULFILLED/,
  /EXPORT_CLOUD_WALLET_FULFILLED/
]

const actionToEvent = action => {
  let base = {
    category: 'GENERAL_ACTION',
    action: action.type.replace('_FULFILLED', '')
  }

  switch (action.type) {
    case 'ADD_RECIPIENT_FULFILLED':
    case 'REMOVE_RECIPIENT_FULFILLED':
    case 'EDIT_RECIPIENT_FULFILLED':
      return {
        category: 'RECIPIENT_ACTION',
        action: action.type.replace('_FULFILLED', '')
      }
    case 'ADD_CRYPTO_ACCOUNTS_FULFILLED':
    case 'REMOVE_CRYPTO_ACCOUNTS_FULFILLED':
    case 'MODIFY_CRYPTO_ACCOUNTS_NAME_FULFILLED':
      return {
        category: 'CRYPTO_ACCOUNTS_ACTION',
        action: action.type.replace('_FULFILLED', ''),
        label: action.meta.track
      }
    case 'DIRECT_TRANSFER_FULFILLED':
    case 'SUBMIT_TX_FULFILLED':
    case 'ACCEPT_TRANSFER_FULFILLED':
    case 'CANCEL_TRANSFER_FULFILLED':
      let value = 0
      if (action.meta.track.transferFiatAmountSpot) {
        value = Math.floor(parseFloat(action.meta.track.transferFiatAmountSpot) * 100)
      }
      return {
        category: 'TRANSFER_ACTION',
        action: action.type.replace('_FULFILLED', ''),
        label: action.meta.track,
        value
      }
    case 'SET_TOKEN_ALLOWANCE_FULFILLED':
      return {
        category: 'TRANSFER_ACTION',
        action: 'SET_TOKEN_ALLOWANCE'
      }
    default:
      return base
  }
}

export const trackAction = action => {
  if (ACTION_WHITELIST.some(rx => rx.test(action.type))) {
    const event = actionToEvent(action)
    // only handle whitelisted actions
    trackGAEvent(event)
    trackIntercomEvent({
      eventName: `${event.category}_${event.action}`,
      meta: event.label
    })
  }
}

const _intercomBoot = metaData => {
  window.intercomSettings = {
    app_id: env.REACT_APP_INTERCOM_APP_ID,
    custom_launcher_selector: '#intercom_launcher',
    ...metaData
  }

  if (window.Intercom) {
    window.Intercom('boot', metaData)
  }
}

export const intercomBoot = () => {
  _intercomBoot({})
}

export const intercomLogin = (userId, profile) => {
  _intercomBoot({
    user_id: userId,
    email: profile.email,
    name: profile.name,
    familyName: profile.familyName,
    givenName: profile.givenName,
    avatar: {
      type: 'avatar',
      image_url: profile.imageUrl
    },
    created_at: profile.registerTime || moment().unix()
  })
}

let currentPage = ''
var currentUserId = null

export const trackerMiddleware = store => next => action => {
  switch (action.type) {
    case 'persist/REHYDRATE':
      initTracker()
      intercomBoot()
      break
    case '@@router/LOCATION_CHANGE':
      const nextPage = `${action.payload.location.pathname}${action.payload.location.search}`

      if (currentPage !== nextPage) {
        currentPage = nextPage
        trackPage(nextPage)
      }
      if (window.Intercom) {
        window.Intercom('update', { last_request_at: parseInt(new Date().getTime() / 1000) })
      }
      break
    case 'POST_LOGIN_PREPARATION_FULFILLED':
      currentUserId = action.payload.userMetaInfo.googleId
      const profile = action.payload.userMetaInfo.profile
      const email = action.payload.userMetaInfo.email
      const registerTime = action.payload.userMetaInfo.registerTime

      trackUser(currentUserId)
      intercomLogin(currentUserId, { ...profile, email, registerTime })
      break
    case 'LOGOUT_FULFILLED':
      trackGAEvent({
        category: 'User',
        action: action.type
      })
      trackIntercomEvent({ eventName: 'LOGOUT' })
      // unregister user
      trackUser(null)
      currentUserId = null
      break
    case 'ENQUEUE_SNACKBAR':
    case 'REMOVE_SNACKBAR':
      // ignore snackbar actions
      break
    default:
      // report all other action types
      trackAction(action)
  }
  // If not a promise, continue on
  if (!isPromise(action.payload)) {
    return next(action)
  } else {
    // report all async errors
    return next(action).catch(error => {
      const errorMsg = typeof error === 'string' ? error : error.message
      trackException({ description: `[${action.type}] ${errorMsg}` })
      throw error
    })
  }
}
