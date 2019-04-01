// @flow

export const enqueueSnackbar = (notification: { key: number, message: string }) => ({
  type: 'ENQUEUE_SNACKBAR',
  notification: {
    key: new Date().getTime() + Math.random(),
    ...notification
  }
})

export const removeSnackbar = (key: number) => ({
  type: 'REMOVE_SNACKBAR',
  key
})
