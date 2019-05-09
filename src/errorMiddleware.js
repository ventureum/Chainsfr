import isPromise from 'is-promise'
import { enqueueSnackbar } from './actions/notificationActions'

export default function errorMiddleware (store) {
  return next => action => {
    // Errors are handled globally by default
    if (!action.meta || !action.meta.localErrorHandling) {
      // If not a promise, continue on
      if (!isPromise(action.payload)) {
        return next(action)
      }

      return next(action).catch(error => {
        store.dispatch(enqueueSnackbar({
          message: (typeof error === 'string') ? error : error.message,
          options: {
            variant: 'error',
            autoHideDuration: 60000
          }
        }))
        throw error
      })
    } else {
      // process as usual, do not handle errors
      return next(action)
    }
  }
}
