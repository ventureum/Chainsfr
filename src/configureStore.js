import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise-middleware'
import errorMiddleware from './errorMiddleware'
import logger from 'redux-logger'
import { persistStore, persistReducer, createTransform } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import reducers from './reducers'
import BN from 'bn.js'
import { routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'

const history = createBrowserHistory()

function configureStore (reducers) {
  const enhancer = compose(
    applyMiddleware(routerMiddleware(history), errorMiddleware, promiseMiddleware(), thunk, logger)
  )

  return createStore(reducers, enhancer)
}

const serializeTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    let serializeState = {}
    Object.entries(inboundState).forEach(entry => {
      let key = entry[0]

      // deep clone trick, necessary to keep redux free from the following
      // transformation
      let value = JSON.parse(JSON.stringify(entry[1]))

      if (key === 'wallet' && value) {
        Object.keys(value).forEach(walletType => {
          let walletByType = value[walletType]
          if (walletByType.accounts instanceof Array) {
            for (let i = 0; i < walletByType.accounts.length; i++) {
              Object.keys(walletByType.accounts[i].balance).forEach(cryptoType => {
                // convert BN to string
                value[walletType].accounts[i].balance[cryptoType] =
                  value[walletType].accounts[i].balance[cryptoType].toString()
              })
            }
          }
        })
      }
      serializeState[entry[0]] = JSON.stringify(value)
    })
    return serializeState
  },
  // transform state being rehydrated
  (outboundState, key) => {
    let unserializeState = {}
    Object.entries(outboundState).forEach(entry => {
      unserializeState[entry[0]] = JSON.parse(entry[1])
      let key = entry[0]
      let value = unserializeState[key]

      if (key === 'wallet' && value) {
        Object.keys(value).forEach(walletType => {
          let walletByType = value[walletType]
          if (walletByType.accounts instanceof Array) {
            for (let i = 0; i < walletByType.accounts.length; i++) {
              Object.keys(walletByType.accounts[i].balance).forEach(cryptoType => {
                // convert string to BN
                value[walletType].accounts[i].balance[cryptoType] =
                  new BN(value[walletType].accounts[i].balance[cryptoType])
              })
            }
          }
        })
      }
    })
    return unserializeState
  },
  // define which reducers this transform gets called for.
  { whitelist: ['walletReducer'] }
)

const persistConfig = {
  key: 'root',
  storage,
  transforms: [
    serializeTransform
  ],
  stateReconciler: autoMergeLevel2,
  whitelist: ['userReducer', 'walletReducer', 'transferReducer', 'formReducer']
}

const persistedReducer = persistReducer(persistConfig, reducers(history))

var store = configureStore(persistedReducer)
var persistor = persistStore(store)

export { store, persistor, history }
