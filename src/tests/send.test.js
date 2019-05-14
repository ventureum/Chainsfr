import React from 'react'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import { Route, BrowserRouter as Router } from 'react-router-dom'
import configureStore from 'redux-mock-store'
import update from 'immutability-helper'

import Transfer from '../components/TransferComponent'

let initialState = {
  formReducer: {
    walletSelection: null,
    cryptoSelection: null,
    transferForm: {
      transferAmount: '',
      password: '',
      destination: '',
      sender: '',
      formError: {
        sender: null,
        destination: null,
        transferAmount: null,
        password: null
      }
    }
  },
  walletReducer: {
    wallet: {
      drive: {
        unlockRequest: null,
        connected: false,
        crypto: {}
      },
      ledger: {
        connected: false,
        network: null,
        crypto: {}
      },
      metamask: {
        connected: false,
        network: null,
        crypto: {}
      }
    }
  }
}

describe('Send a transfer', () => {
  let state = initialState
  const mockStore = configureStore()
  let testRenderer
  let container = (step, currentState) => {
    let store = mockStore(currentState)
    return (
      <Provider store={store}>
        <Router>
          <Route render={matchProps => (
            <Transfer
              {...matchProps}
              step={0}
            />
          )}
          />
        </Router>
      </Provider>
    )
  }

  testRenderer = renderer.create(
    container(0, state)
  )

  it('render walletSelection(step 0)', () => {
    expect(testRenderer.toJSON()).toMatchSnapshot()
  })

  it('select wallet(Metamask)', () => {
    state = update(state, {
      formReducer: {
        walletSelection: { $set: 'metamask' }
      }
    })
    testRenderer.update(container(0, state))
    expect(testRenderer.toJSON()).toMatchSnapshot()
  })

  it('select crypto(ethereum)', () => {
    state = update(state, {
      formReducer: {
        cryptoSelection: { $set: 'ethereum' }
      }
    })
    testRenderer.update(container(0, state))
    expect(testRenderer.toJSON()).toMatchSnapshot()
  })
})
