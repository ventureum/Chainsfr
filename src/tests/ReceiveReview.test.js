
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import update from 'immutability-helper'

import ReceiveReview from '../components/ReceiveReviewComponent'

const destinationAddress = '0x4cAa4D1CA9170A72871898dA6a89D4DcbF957551'

const initialProps = {
  actionsPending: {
    getTxFee: false,
    acceptTransfer: false
  },
  txFee: {
    costInBasicUnit: '21000000000000',
    costInStandardUnit: '0.000021',
    gas: '21000',
    price: '1000000000'
  },
  transfer: {
    destination: 'clzhong@ventureum.io',
    receivingId: '9bfb6aa3-923a-44d5-aea0-a90def5c9e61',
    sendTimestamp: '1558975386',
    sendTxHash: '0x55f72c0e1fff27d70569bc369f49ca7c2f1f27b59a57c538fcd70ac55719b1c5',
    sendTxState: 'Confirmed',
    sender: 'clzhong@ventureum.io',
    transferAmount: '0.001',
    cryptoType: 'ethereum'

  },
  wallet: { crypto: { 'ethereum': [{ address: '0x0' }] } },
  escrowWallet: { crypto: { 'ethereum': [{ address: '0x0' }] } },
  sentOn: 'May 27th 2019, 12:43:06',
  walletSelection: 'testWallet',
  destinationAddress: destinationAddress,
  acceptTransfer: () => {},
  goToStep: () => {},
  currencyAmount: {
    transferAmount: '100.2 USD',
    receiveAmount: '10.44 USD',
    txFee: '2.1 USD'
  },
  receiveAmount: '0.001'
}
let wrapper

describe('ReceiveReviewComponent render', () => {
  beforeEach(() => {
    wrapper = mount(<ReceiveReview {...initialProps} />)
  })

  afterEach(() => {
    expect(toJson(wrapper.render())).toMatchSnapshot()
  })

  it('Initial render', () => {
    expect(wrapper.find(Typography).filter('#sender').text()).toEqual(initialProps.transfer.sender)
    expect(wrapper.find(Typography).filter('#destination').text()).toEqual(initialProps.transfer.destination)
    expect(wrapper.find(Typography).filter('#sentOn').text()).toEqual(initialProps.sentOn)
    expect(wrapper.find(Typography).filter('#destinationAddress').text()).toEqual(initialProps.destinationAddress)
    expect(wrapper.find(Typography).filter('#transferAmount').text()).toEqual(`${initialProps.transfer.transferAmount} ETH`)
    expect(wrapper.find(Typography).filter('#receiveAmount').text()).toEqual(`${initialProps.receiveAmount} ETH`)
  })

  it('ERC 20', () => {
    wrapper.setProps(update(initialProps, { transfer: { cryptoType: { $set: 'dai' } } }))
    expect(wrapper.find(Typography).filter('#receiveAmount').text()).toEqual(`${initialProps.receiveAmount} DAI`)
  })

  // actionsPending
  it('getTxCost', () => {
    wrapper.setProps(update(initialProps, { actionsPending: { getTxFee: { $set: true } } }))
    expect(wrapper.find(CircularProgress)).toHaveLength(2)
  })

  it('actionsPending.acceptTransfer', () => {
    wrapper.setProps(update(initialProps, { actionsPending: { acceptTransfer: { $set: true } } }))
    expect(wrapper.find(CircularProgress)).toHaveLength(1)
    expect(wrapper.find(Button).filter('#complete').prop('disabled')).toEqual(true)
  })
})

describe('ReceiveReviewComponent interaction', () => {
  beforeEach(() => {
    wrapper = mount(<ReceiveReview {...initialProps} />)
  })

  it('acceptTransfer', () => {
    const mockFunction = jest.fn()
    wrapper.setProps({ acceptTransfer: mockFunction })
    wrapper.find(Button).filter('#complete').simulate('click')
    expect(mockFunction.mock.calls.length).toEqual(1)
  })

  it('goToStep', () => {
    const mockFunction = jest.fn()
    wrapper.setProps({ goToStep: mockFunction })
    wrapper.find(Button).filter('#cancel').simulate('click')
    expect(mockFunction.mock.calls[0][0]).toEqual(-1)
  })
})
