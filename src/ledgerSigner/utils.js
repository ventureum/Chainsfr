import { bufferToInt } from 'ethereumjs-util'

export const getBufferFromHex = hex => {
  const _hex = hex.toLowerCase().replace('0x', '')
  return new Buffer(_hex, 'hex')
}

export const bufferToHex = buffer => {
  return '0x' + buffer.toString('hex')
}

export const calculateChainIdFromV = v => {
  const sigV = bufferToInt(v)
  let chainId = Math.floor((sigV - 35) / 2)
  if (chainId < 0) chainId = 0
  return chainId
}

export const getSignTransactionObject = tx => {
  return {
    rawTransaction: bufferToHex(tx.serialize()),
    tx: {
      nonce: bufferToHex(tx.nonce),
      gasPrice: bufferToHex(tx.gasPrice),
      gas: tx.gasLimit ? bufferToHex(tx.gasLimit) : bufferToHex(tx.gas),
      to: bufferToHex(tx.to),
      value: bufferToHex(tx.value),
      input: bufferToHex(tx.data),
      v: bufferToHex(tx.v),
      r: bufferToHex(tx.r),
      s: bufferToHex(tx.s),
      hash: bufferToHex(tx.hash())
    }
  }
}

export const networkIdMap = {
  'mainnet': 1,
  'ropsten': 3,
  'rinkeby': 4,
  'kovan': 42

}
