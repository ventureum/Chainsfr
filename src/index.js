import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import 'typeface-roboto'
import { store, persistor } from './configureStore.js'
import { PersistGate } from 'redux-persist/integration/react'

function render () {
  ReactDOM.render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
    , document.getElementById('root'))
  registerServiceWorker()
}

document.addEventListener('DOMContentLoaded', () => render())
