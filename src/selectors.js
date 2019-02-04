import _ from 'lodash'

const createErrorSelector = (actions) => (state) => {
  // returns the first error messages for actions
  // * We assume when any request fails on a page that
  //   requires multiple API calls, we shows the first error
  return _(actions)
    .map((action) => _.get(state, `errorReducer.${action}`))
    .compact()
    .first() || ''
}

const createLoadingSelector = (actions) => (state) => {
  // returns true only when all actions is not loading
  return _(actions)
    .some((action) => _.get(state, `loadingReducer.${action}`))
}

export { createErrorSelector, createLoadingSelector }
