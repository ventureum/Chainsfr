// @flow

export const enqueueSnackbar = (notification: { message: string, key: ?number, options: ?Object }) => ({
  type: 'ENQUEUE_SNACKBAR',
  notification: {
    key: new Date().getTime() + Math.random(),
    ...notification
  }

})

export const closeSnackbar = (key: number) => ({
  type: 'CLOSE_SNACKBAR',
  dismissAll: !key, // dismiss all if no key has been defined
  key
})

export const removeSnackbar = (key: number) => ({
  type: 'REMOVE_SNACKBAR',
  key
})
