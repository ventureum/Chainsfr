import Web3 from 'web3'
import ERC20_ABI from '../contracts/ERC20.js'
import { getCrypto } from '../tokens'
import url from '../url'

async function getBalance (address, cryptoType) {
  let web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
  const targetContract = new web3.eth.Contract(ERC20_ABI, getCrypto(cryptoType).address)
  return targetContract.methods.balanceOf(address).call()
}

async function getTransferTxObj (from, to, transferAmount, cryptoType) {
  let web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
  let contractAddr = getCrypto(cryptoType).address
  const targetContract = new web3.eth.Contract(ERC20_ABI, contractAddr)
  let data = targetContract.methods.transfer(to, transferAmount).encodeABI()

  return {
    from: from,
    to: contractAddr,
    data: data
  }
}

export default { getBalance, getTransferTxObj }
