// @flow
import log from 'loglevel'
import pWaitFor from 'p-wait-for'
const _ = require('lodash')
log.setDefaultLevel('info')

type StateChangeType = {
  prevState: ?Object,
  action: ?{
    type: string,
    payload: Object
  },
  nextState: ?Object
}

class ReduxTracker {
  stateChanges: Array<StateChangeType> = []
  status: ?string = null
  includedStateChangesNotFound: Array<StateChangeType> = []

  validate (
    includedStateChanges: Array<StateChangeType>,
    excludedStateChanges: Array<StateChangeType>
  ) {
    let found = Array(includedStateChanges.length).fill(false)
    for (let stateChange of this.stateChanges) {
      const includeIdx = includedStateChanges.findIndex(
        item => item.action && stateChange.action && item.action.type === stateChange.action.type
      )

      if (includeIdx !== -1) {
        found[includeIdx] = true
      }

      const excludeIdx = excludedStateChanges.findIndex(item => {
        const rv = _.isMatch(stateChange.action, item.action)
        if (rv)
          log.error('Excluded state change found:', JSON.stringify(stateChange.action, null, 2))
        return rv
      })
      // none of excludedStateChanges should appear in the action list
      // terminate on first error
      if (excludeIdx !== -1) {
        this.status = 'FAILED'
        return true
      }
    }
    const nonTrueIdx = found.findIndex(item => !item)

    // log states not found in includedStateChanges
    this.includedStateChangesNotFound = []
    found.map((val, idx) => {
      if (!val) {
        this.includedStateChangesNotFound.push(includedStateChanges[idx])
      }
    })
    // all actions in the includedStateChanges should appear in the action list
    // if not, return false, and continue polling
    // otherwise, mark validation as "passed" and stop
    if (nonTrueIdx === -1) {
      this.status = 'PASSED'
    }
    return nonTrueIdx === -1
  }

  async collectReduxLogs (msg: any) {
    try {
      const args = await msg.args()
      let _args = []
      for (let arg of args) {
        const val = await arg.jsonValue()
        _args.push(val)
      }
      if (_args[0] === '%c prev state') {
        this.stateChanges.push({
          prevState: _args[2],
          action: null,
          nextState: null
        })
      } else if (_args[0] === '%c action    ') {
        if (this.stateChanges.length == 0) {
          // may receive incomplete state logs
          // should not crash in this case
          this.stateChanges.push({
            prevState: null,
            action: _args[2],
            nextState: null
          })
        } else {
          this.stateChanges[this.stateChanges.length - 1].action = _args[2]
        }
      } else if (_args[0] === '%c next state') {
        if (this.stateChanges.length == 0) {
          // may receive incomplete state logs
          // should not crash in this case
          this.stateChanges.push({
            prevState: null,
            action: null,
            nextState: _args[2]
          })
        } else {
          this.stateChanges[this.stateChanges.length - 1].nextState = _args[2]
        }
      }
    } catch (e) {
      if (e.message && e.message.includes('Target closed')) {
        // ignore target closed error
        // browser may be closed before listener is removed
      } else {
        throw e
      }
    }
  }

  async waitFor (
    includedStateChanges: Array<StateChangeType> = [],
    excludedStateChanges: Array<StateChangeType> = [],
    timeout: number = 30000
  ) {
    this.status = null
    this.stateChanges = []

    const listener = this.collectReduxLogs.bind(this)

    try {
      // monitor console log
      page.on('console', listener)
      log.info('ReduxTracker started')
      // wait till validation process finishes
      await pWaitFor(() => this.validate(includedStateChanges, excludedStateChanges), {
        timeout: timeout,
        interval: 1000
      })
    } catch (e) {
      if (e.name === 'TimeoutError') {
        log.error('Validation timeout due to the following includedStateChanges all found:', this.includedStateChangesNotFound)
      } else {
        throw e
      }
    } finally {
      page.removeListener('console', listener)
    }

    if (this.status === 'FAILED') {
      log.error(
        'Validation failed due to at least one of excludedStateChanges found, see error logs for details'
      )
    }
    expect(this.status).toBe('PASSED')
    log.info('ReduxTracker validation passed')
  }
}

export default ReduxTracker
