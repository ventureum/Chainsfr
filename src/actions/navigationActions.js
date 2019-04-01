// @flow
// Moves the pointer in the history stack by n entries
function goToStep (transferAction: string, n: number) {
  return {
    type: 'GO_TO_STEP',
    payload: { transferAction, n }
  }
}

function backToHome () {
  return {
    type: 'BACK_TO_HOME'
  }
}

export { goToStep, backToHome }
