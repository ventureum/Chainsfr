import isPromise from 'is-promise'

export default function errorMiddleware () {
  return next => action => {
    // If not a promise, continue on
    if (!isPromise(action.payload)) {
      return next(action)
    }

    /*
     * The error middleware serves to dispatch the initial pending promise to
     * the promise middleware, but adds a `catch`.
     */
    if (action.meta && action.meta.globalError === true) {
      // Dispatch initial pending promise, but catch any errors
      return next(action).catch(error => {
        if (!action.meta.silent) {
          // warn in console if silent === false
          console.warn(error)
        }
        return error
      })
    }

    return next(action)
  }
}
