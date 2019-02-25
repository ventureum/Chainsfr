// Moves the pointer in the history stack by n entries
function goToStep (transferAction, n) {
  return {
    type: 'GO_TO_STEP',
    payload: { transferAction, n }
  }
}

export { goToStep }
