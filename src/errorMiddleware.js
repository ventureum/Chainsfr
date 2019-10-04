import isPromise from 'is-promise'
import { enqueueSnackbar } from './actions/notificationActions'

const ERROR_WHITELIST = [
  'Incorrect WalletLink network',
  'Incorrect password',
  'Get crypto price failed.',
  'Metamask not found'
]

export default function errorMiddleware (store) {
  return next => action => {
    // Errors are handled globally by default
    if (!action.meta || !action.meta.localErrorHandling) {
      // If not a promise, continue on
      if (!isPromise(action.payload)) {
        return next(action)
      }

      return next(action).catch(error => {
        let message = ''
        if (typeof error === 'string') {
          message = error
        } else if (error instanceof Error) {
          message = error.toString()
        } else {
          message = `Unknow error: ${error}`
        }
        if (message.length > 120) {
          message = message.slice(0, 120) + '...'
        }

        if (!ERROR_WHITELIST.includes(message)) {
          store.dispatch(
            enqueueSnackbar({
              message: message,
              options: {
                variant: 'error',
                autoHideDuration: 60000
              }
            })
          )
        }
        throw error
      })
    } else {
      // process as usual, do not handle errors
      return next(action)
    }
  }
}
