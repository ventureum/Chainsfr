import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { onLogout } from '../../actions/userActions'
import Web3 from 'web3'
import ERC20 from '../../ERC20'
import { createWallet } from '../../wallets/WalletFactory'
import pWaitFor from 'p-wait-for'
import url from '../../url'

// This component is intended to be used in test environment ONLY
const Disconnect = (props) => {
  const dispatch = useDispatch()
  const [allowance, setAllowance] = useState(null)
  const [allowanceTxHash, setAllowanceTxHash] = useState(null)
  const cryptoAccounts = useSelector(state => state.accountReducer.cryptoAccounts)

  const setAllowanceWithDriveWallet= async () => {
    const daiDriveAccount = cryptoAccounts.find(c => c.walletType === 'drive' && c.cryptoType === 'dai')
    const _wallet = createWallet(daiDriveAccount)
    await _wallet.checkWalletConnection() // decrypt private key
    const txHash = await _wallet.setTokenAllowance(allowance)

    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    await pWaitFor(async () => {
      const txReceipt = await _web3.eth.getTransactionReceipt(txHash)
      if (txReceipt && txReceipt.status) {
        return true
      }
      return false
    })
    setAllowanceTxHash(txHash)
  }

  const setAllowanceWithMetamask = async () => {
    await window.ethereum.enable()
    const _web3 = new Web3(window.ethereum)
    // allowance is in basic token unit
    const txObj = ERC20.getSetAllowanceTxObj(
      // mock address
      '0xD3cEd3b16C8977ED0E345D162D982B899e978588',
      allowance,
      'dai'
    )
    // hard-coded gas to avoid weird out-of-gas from web3 using
    // web3.eth.estimateGas
    // 200,000
    txObj.gas = '0x30d40'
    // 20 GWEI
    txObj.gasPrice = '0x4a817c800'
    const txReceipt = await _web3.eth.sendTransaction(txObj)
    if (txReceipt.status === true) {
      setAllowanceTxHash(txReceipt.transactionHash)
    }
  }

  return (
    <>
      <button
        id='disconnect'
        onClick={() => {
          dispatch(onLogout(true, true))
        }}
      >
        Disconnect
      </button>
      <form data-test-id='set_erc20_allowance' noValidate autoComplete='off'>
        <TextField name='allowance' onChange={(e) => setAllowance(e.target.value)} />
        <Button variant='contained' onClick={() => setAllowanceWithMetamask()}>
          Set Allowance metamask
        </Button>
        <Button variant='contained' onClick={() => setAllowanceWithDriveWallet()}>
          Set Allowance drive
        </Button>
        {allowanceTxHash && (
          <Typography data-test-id='allowance_tx_hash'> {allowanceTxHash} </Typography>
        )}
      </form>
    </>
  )
}
export default Disconnect
