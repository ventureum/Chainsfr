import { useEffect, useRef } from 'react'
import { createLoadingSelector, createErrorSelector } from './selectors'
import { useStore } from 'react-redux'

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
    actionsFulfilled[action] =  prevActionsPending && prevActionsPending[action] && !actionsPending[action] && !errors[action]
  }

  return { actionsPending, actionsFulfilled, errors }
}
