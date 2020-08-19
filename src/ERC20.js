import BN from 'bn.js'
import ERC20_ABI from './contracts/ERC20.js'
import url from './url'
import WalletUtils from './wallets/utils'
import env from './typedEnv'
import SimpleMultiSigContractArtifacts from './contracts/SimpleMultiSig.json'
import { store } from './configureStore'

async function getBalance (address, cryptoType) {
  const Web3 = require('web3')
  let web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
  const targetContract = new web3.eth.Contract(
    ERC20_ABI,
    store.getState().accountReducer.ethContracts[cryptoType].address
  )
  return targetContract.methods.balanceOf(address).call()
}

async function getAllowance (owner, spender, cryptoType) {
  const Web3 = require('web3')
  let web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
  const targetContract = new web3.eth.Contract(
    ERC20_ABI,
    store.getState().accountReducer.ethContracts[cryptoType].address
  )
  return targetContract.methods.allowance(owner, spender).call()
}

function getSetAllowanceTxObj (from, amount, cryptoType) {
  const Web3 = require('web3')
  let web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
  const targetContract = new web3.eth.Contract(
    ERC20_ABI,
    store.getState().accountReducer.ethContracts[cryptoType].address
  )

  const NETWORK_ID = WalletUtils.networkIdMap[env.REACT_APP_ETHEREUM_NETWORK]
  const multiSigAddr = SimpleMultiSigContractArtifacts.networks[NETWORK_ID].address

  const data = targetContract.methods.approve(multiSigAddr, amount).encodeABI()

  return {
    from: from,
    to: store.getState().accountReducer.ethContracts[cryptoType].address,
    data: data,
    value: '0'
  }
}

async function getTransferTxObj (from, to, transferAmount, cryptoType) {
  const Web3 = require('web3')
  let web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
  let contractAddr = store.getState().accountReducer.ethContracts[cryptoType].address

  const targetContract = new web3.eth.Contract(ERC20_ABI, contractAddr)
  let data = targetContract.methods.transfer(to, transferAmount).encodeABI()

  return {
    from: from,
    to: contractAddr,
    data: data,
    value: '0'
  }
}

async function getGasPriceGivenBalance (address, gas) {
  const Web3 = require('web3')
  let web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
  let balance = new BN(await web3.eth.getBalance(address))
  return balance.div(new BN(gas)).toString()
}

export default {
  getBalance,
  getAllowance,
  getTransferTxObj,
  getGasPriceGivenBalance,
  getSetAllowanceTxObj
}
