
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import update from 'immutability-helper'
import MuiLink from '@material-ui/core/Link'
import WalletUtils from '../wallets/utils'

import CancelReview from '../components/CancelReviewComponent'

const destinationAddress = '0x4cAa4D1CA9170A72871898dA6a89D4DcbF957551'

const initialProps = {
  actionsPending: {
    getTransfer: false,
    verifyPassword: false,
    cancelTransfer: false,
    getTxFee: false
  },
  txFee: {
    costInBasicUnit: '21000000000000',
    costInStandardUnit: '0.000021',
    gas: '21000',
    price: '1000000000'
  },
  transfer: {
    destination: 'clzhong@ventureum.io',
    sendingId: '9bfb6aa3-923a-44d5-aea0-a90def5c9e61',
    sendTimestamp: '1558975386',
    sendTxHash: '0x55f72c0e1fff27d70569bc369f49ca7c2f1f27b59a57c538fcd70ac55719b1c5',
    sendTxState: 'Confirmed',
    sender: 'clzhong@ventureum.io',
    transferAmount: '0.001',
    cryptoType: 'ethereum'
  },
  escrowWallet: { crypto: { 'ethereum': [{ address: '0x0' }] } },
  sendTime: 'May 27th 2019, 12:43:06',
  walletSelection: 'testWallet',
  destinationAddress: destinationAddress,
  cancelTransfer: () => {},
  toCurrencyAmount: (cryptoAmount) => '100.234 USD'
}
let wrapper

describe('CancelReviewComponent render', () => {
  beforeEach(() => {
    wrapper = mount(<CancelReview {...initialProps} />)
  })

  afterEach(() => {
    expect(toJson(wrapper.render())).toMatchSnapshot()
  })

  it('initial render', () => {
    const { transferAmount, sender, destination } = initialProps.transfer
    expect(wrapper.find(Typography).filter('#sender').text()).toEqual(sender)
    expect(wrapper.find(Typography).filter('#destination').text()).toEqual(destination)
    expect(wrapper.find(Typography).filter('#transferAmount').text()).toEqual(`${transferAmount} ETH`)
    expect(wrapper.find(Typography).filter('#sendTime').text()).toEqual(initialProps.sendTime)
    expect(wrapper.find(Typography).filter('#title').text()).toEqual('Transfer details')
  })

  it('received', () => {
    const receiveTime = 'May 27th 2019, 12:43:06'
    const receiveTxHash = '0x55f72c0e1fff27d70569bc369f49ca7c2f1f27b59a57c538fcd70ac55719b1c5'
    wrapper.setProps(update(initialProps, { receiveTime: { $set: receiveTime }, transfer: { receiveTxHash: { $set: receiveTxHash } } }))
    expect(wrapper.find(Typography).filter('#title').text()).toEqual('Transfer has been received')
    expect(wrapper.find(Typography).filter('#actionTime').text()).toEqual(receiveTime)
    expect(wrapper.find(MuiLink).prop('href')).toEqual(`https://rinkeby.etherscan.io/tx/${receiveTxHash}`)
    expect(wrapper.find(Button).filter('#cancel')).toHaveLength(0)
  })

  it('cancel', () => {
    const cancelTime = 'May 27th 2019, 12:43:06'
    const cancelTxHash = '0x55f72c0e1fff27d70569bc369f49ca7c2f1f27b59a57c538fcd70ac55719b1c5'
    wrapper.setProps(update(initialProps, { cancelTime: { $set: cancelTime }, transfer: { cancelTxHash: { $set: cancelTxHash } } }))
    expect(wrapper.find(Typography).filter('#title').text()).toEqual('Transfer has already been cancelled')
    expect(wrapper.find(Typography).filter('#actionTime').text()).toEqual(cancelTime)
    expect(wrapper.find(MuiLink).prop('href')).toEqual(`https://rinkeby.etherscan.io/tx/${cancelTxHash}`)
    expect(wrapper.find(Button).filter('#cancel')).toHaveLength(0)
  })

  it('transfer not fetched', () => {
    wrapper.setProps(update(initialProps, { transfer: { $set: null } }))
    expect(wrapper.find(CircularProgress)).toHaveLength(1)
  })

  it('actionPending.getTransfer', () => {
    wrapper.setProps(update(initialProps, { actionsPending: { getTransfer: { $set: true } } }))
    expect(wrapper.find(CircularProgress)).toHaveLength(1)
  })

  it('actionPending.verifyPassword', () => {
    wrapper.setProps(update(initialProps, { actionsPending: { verifyPassword: { $set: true } } }))
    expect(wrapper.find(CircularProgress)).toHaveLength(1)
  })

  it('actionPending.txFee', () => {
    wrapper.setProps(update(initialProps, { actionsPending: { getTxFee: { $set: true } } }))
    expect(wrapper.find(CircularProgress)).toHaveLength(1)
  })
})

describe('CancelReviewComponent interaction', () => {
  beforeEach(() => {
    wrapper = mount(<CancelReview {...initialProps} />)
  })

  it('cancel Transfer', () => {
    const mockFunction = jest.fn()
    const props = { ...initialProps, cancelTransfer: mockFunction }
    wrapper = mount(shallow(<CancelReview {...props} />).get(0))

    wrapper.find(Button).filter('#cancel').simulate('click')
    // force update
    wrapper.update()
    expect(wrapper.state('open')).toEqual(true)
    // check if the modal is rendered
    expect(wrapper.find(Button).someWhere(b => b.text() === 'Let me think again')).toEqual(true)

    wrapper.find(Button).filter('#confirmCancel').simulate('click')
    expect(mockFunction.mock.calls[0][0]).toEqual({
      escrowWallet: WalletUtils.toWalletDataFromState('escrow', initialProps.transfer.cryptoType, initialProps.escrowWallet),
      sendingId: initialProps.transfer.sendingId,
      sendTxHash: initialProps.transfer.sendTxHash,
      transferAmount: initialProps.transfer.transferAmount,
      txFee: initialProps.txFee
    })

    wrapper.setProps(update(initialProps, { actionsPending: { cancelTransfer: { $set: true } } }))
    expect(wrapper.find(CircularProgress)).toHaveLength(1)

    // close modal
    wrapper.find(Button).filter('#close').simulate('click')
    expect(wrapper.state('open')).toEqual(false)
  })
})
