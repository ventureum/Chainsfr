import isPromise from 'is-promise'

export default function errorMiddleware (store) {
  return next => action => {
    // Errors are handled globally by default
    if (!action.meta || !action.meta.localErrorHandling) {
      // If not a promise, continue on
      if (!isPromise(action.payload)) {
        return next(action)
      }

      return next(action).catch(error => {
        console.error(error.message)
        throw error
      })
    } else {
      // process as usual, do not handle errors
      return next(action)
    }
  }
}
