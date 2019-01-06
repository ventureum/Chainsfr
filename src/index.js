import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import 'typeface-roboto'
import { store, persistor } from './configureStore.js'
import { PersistGate } from 'redux-persist/integration/react'
import Web3 from 'web3'

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

async function init () {
  window._web3 = new Web3("https://ropsten.infura.io/v3/e2011dafd4c240bd8720f84ca826a7b2")

  console.log('init ... ')
  if (!window.gapi.client) {
    console.log('loading client ... ')
    let config =  {
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
      client_id: '754636752811-bdve3j98l74duv96vit2hqm635io3cjv.apps.googleusercontent.com',
    }
    window.gapi.load('client', async function () {
      console.log('loading client done. ')
      await window.gapi.client.init(config)
      if (!window.gapi.client.drive) {
        await window.gapi.client.load('drive', 'v3')
      }
      render()
    })
  } else {
    render()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init()
})
