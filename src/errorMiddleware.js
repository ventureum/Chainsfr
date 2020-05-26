import isPromise from 'is-promise'
import { enqueueSnackbar } from './actions/notificationActions'
import env from './typedEnv'
import * as Sentry from '@sentry/browser'

if (env.REACT_APP_SENTRY_ID) {
  Sentry.init({ dsn: env.REACT_APP_SENTRY_ID })
}

export default function errorMiddleware (store) {
  return next => action => {
    // If not a promise, continue on
    if (!isPromise(action.payload)) {
      return next(action)
    }
    // Errors are handled globally by default
    if (!action.meta || !action.meta.localErrorHandling) {
      return next(action).catch(error => {
        console.error(error.message)
        store.dispatch(
          enqueueSnackbar({
            message: error.message,
            key: new Date().getTime() + Math.random(),
            options: { variant: 'error', autoHideDuration: 3000 }
          })
        )
      })
    } else {
      // process as usual, do not handle errors
      return next(action).catch(error => {
        const { profile } = store.getState().userReducer
        Sentry.withScope(scope => {
          if (profile) {
            const { profileObj } = profile
            scope.setTag('id', profileObj.googleId)
            scope.setTag('username', profileObj.name)
            scope.setTag('email', profileObj.email)
            scope.setTag('action', action.type)
          }
          scope.setLevel('error')
          // will be tagged with my-tag="my value"
          Sentry.captureException(error)
        })
        throw error
      })
    }
  }
}
