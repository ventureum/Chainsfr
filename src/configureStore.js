import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise-middleware'
import errorMiddleware from './errorMiddleware'
import logger from 'redux-logger'
import { persistStore, persistReducer } from 'redux-persist'
// import { persistStore, persistReducer, createTransform } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import reducers from './reducers'
import { routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'
import { trackerMiddleware } from './trackerMiddleware'

const history = createBrowserHistory()

function configureStore (reducers) {
  const middlewares = [
    routerMiddleware(history),
    trackerMiddleware,
    errorMiddleware,
    promiseMiddleware(),
    thunk
  ]

  if (process.env.NODE_ENV === `development`) {
    middlewares.push(logger)
  }

  const enhancer = compose(applyMiddleware(...middlewares))

  return createStore(reducers, enhancer)
}

// const serializeTransform = createTransform(
//   // transform state on its way to being serialized and persisted.
//   (inboundState, key) => {
//     let serializeState = {
//       wallet: {
//         ledger: {
//           crypto: JSON.parse(JSON.stringify(inboundState.wallet.ledger.crypto))
//         }
//       }
//     }
//     return serializeState
//   },
//   // transform state being rehydrated
//   (outboundState, key) => {
//     return outboundState
//   },
//   // define which reducers this transform gets called for.
//   { whitelist: ['walletReducer'] }
// )

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
  // transforms: [serializeTransform],
  whitelist: ['userReducer', 'walletReducer']
}

const persistedReducer = persistReducer(persistConfig, reducers(history))

var store = configureStore(persistedReducer)
var persistor = persistStore(store)

export { store, persistor, history }
