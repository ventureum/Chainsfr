import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise-middleware'
import logger from 'redux-logger'
import { persistStore, persistReducer, createTransform } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import reducers from './reducers'
import BN from 'bn.js'

function configureStore (reducers) {
  const enhancer = compose(
    applyMiddleware(promiseMiddleware(), thunk, logger)
  )

  return createStore(reducers, enhancer)
}

const serializeTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    let serializeState = {}
    Object.entries(inboundState).forEach(entry => {
      let key = entry[0]
      let value = Object.assign({}, entry[1])
      if (key === 'metamask') {
        // convert balance BN object to string
        if (value.balance) {
          value.balance = value.balance.toString()
        }
      }

      serializeState[key] = JSON.stringify(value)
    })
    return serializeState
  },
  // transform state being rehydrated
  (outboundState, key) => {
    let unserializeState = {}
    Object.entries(outboundState).forEach(entry => {
      let key = entry[0]
      unserializeState[key] = JSON.parse(outboundState[key])
      if (key === 'metamask') {
        // convert balance BN object to string
        if (unserializeState[key].balance) {
          unserializeState[key].balance = new BN(unserializeState[key].balance)
        }
      }
    })
    return unserializeState
  },
  // define which reducers this transform gets called for.
  { whitelist: ['userReducer'] }
)

const persistConfig = {
  key: 'root',
  storage,
  transforms: [
    serializeTransform
  ],
  stateReconciler: autoMergeLevel2,
  whitelist: ['userReducer', 'transferReducer']
}

const persistedReducer = persistReducer(persistConfig, reducers)

var store = configureStore(persistedReducer)
var persistor = persistStore(store)

export { store, persistor }
