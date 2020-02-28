import { useEffect, useRef } from 'react'
import { useStore, useSelector } from 'react-redux'
import _ from 'lodash'

const createErrorSelector = (actions) => (state) => {
  // returns the first error messages for actions
  // * We assume when any request fails on a page that
  //   requires multiple API calls, we shows the first error
  return _(actions)
    .map((action) => useSelector(state => state.errorReducer[action]))
    .compact()
    .first() || ''
}
const createLoadingSelector = (actions) => (state) => {
  // returns true only when all actions is not loading
  return _(actions)
    .some((action) => useSelector(state => state.loadingReducer[action]))
}

export function usePrevious (value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

export function useActionTracker (actions, actionTypes) {
  const store = useStore()
  const state = store.getState()
  let actionsPending = {}
  let prevActionsPending = {}
  let actionsFulfilled = {}
  let errors = {}
  for (let i = 0; i < actions.length; i++) {
    actionsPending[actions[i]] = createLoadingSelector(actionTypes[i])(state)
    errors[actions[i]] = createErrorSelector(actionTypes[i])(state)
  }

  prevActionsPending = usePrevious(actionsPending)

  for (let action of actions) {
    actionsFulfilled[action] =
      prevActionsPending && prevActionsPending[action] && !actionsPending[action] && !errors[action]
  }

  return { actionsPending, actionsFulfilled, errors }
}
