import Recipient from '../components/RecipientComponent'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import update from 'immutability-helper'

const mockWallet = {
  connected: true,
  crypto: {
    ethereum:
      [{
        address: 'e7b7baf2b41c61f9f376ae3a5bc2cd78709995a7',
        balance: '10000000000000000',
        id: '0737b8f5-7f3e-46f8-8489-a60a8b9d3158',
        version: 3
      }],
    dai:
      [{
        address: 'e7b7baf2b41c61f9f376ae3a5bc2cd78709995a7',
        balance: '10000000000000000',
        id: '0737b8f5-7f3e-46f8-8489-a60a8b9d3158',
        version: 3
      }],
    bitcoin:
      [{
        address: 'mtHrY25GUMvSsj9s72BQjPbK5iDvJykGFh',
        balance: '34432784',
        privateKey: '6PYSS2TUay4BfyA3VBzidSmz5GqSbfe2cUoDobWomkL7acsb1AJbGRU6mK'
      }]
  }
}

const mockValidEmail = 'abc@gmail.com'
const mockInvalidEmail = 'abccom'
const mockValidAmount = '0.001'
const mockInvalidAmountETH = '0.01'
const mockInvalidAmountBTC = '0.344'
const largeAmount = '100000'
const mockInvalidAmount = '0.0001'
const mockValidPassword = '123456'
const mockInvalidPassword = '123'

const mockTransferForm = {
  transferAmount: '',
  destination: '',
  password: '',
  sender: '',
  formError: {
    destination: null,
    password: null,
    sender: null,
    transferAmount: null
  }
}
let initialProps = {
  updateTransferForm: () => {},
  generateSecurityAnswer: () => {},
  clearSecurityAnswer: () => {},
  goToStep: () => {},
  getTxFee: () => {},
  cryptoSelection: 'ethereum',
  walletSelection: 'metamask',
  transferForm: mockTransferForm,
  wallet: mockWallet,
  txFee: undefined,
  actionsPending: {
    getTxCost: false
  }
}
let wrapper
describe('RecipientComponent render', () => {
  beforeEach(() => {
    wrapper = mount(
      <Recipient {...initialProps} />
    )
  })

  it('initial render', () => {
    // initial render
    expect(toJson(wrapper.render())).toMatchSnapshot()
  })

  // valid inputs
  it('valid input render', () => {
    wrapper.setProps({ transferForm: {
      ...initialProps.transferForm,
      sender: mockValidEmail,
      destination: mockValidEmail,
      transferAmount: mockValidAmount,
      password: mockValidPassword
    } })
    expect(toJson(wrapper)).toMatchSnapshot()
    expect(wrapper.find(TextField).filter('#sender').prop('value')).toEqual(mockValidEmail)
    expect(wrapper.find(TextField).filter('#destination').prop('value')).toEqual(mockValidEmail)
    expect(wrapper.find(TextField).filter('#amount').prop('value')).toEqual(mockValidAmount)
    expect(wrapper.find(TextField).filter('#password').prop('value')).toEqual(mockValidPassword)
  })

  // invalid inputs
  it('invalid inputs', () => {
    const errorMsg = 'error'
    wrapper.setProps({ transferForm: {
      sender: mockInvalidEmail,
      destination: mockInvalidEmail,
      transferAmount: largeAmount,
      password: mockInvalidPassword,
      formError: {
        sender: errorMsg,
        destination: errorMsg,
        transferAmount: errorMsg,
        password: errorMsg
      }
    } })
    expect(toJson(wrapper)).toMatchSnapshot()
    expect(wrapper.find(TextField).filter('#sender').prop('helperText')).toEqual(errorMsg)
    expect(wrapper.find(TextField).filter('#destination').prop('helperText')).toEqual(errorMsg)
    expect(wrapper.find(TextField).filter('#amount').prop('helperText')).toEqual(errorMsg)
    expect(wrapper.find(TextField).filter('#password').prop('error')).toEqual(true)
    expect(wrapper.find(Button).filter('#continue').prop('disabled')).toEqual(true)
  })

  // balance does not exist
  it('balance undefined', () => {
    wrapper.setProps(update(initialProps, { wallet: { crypto: { ethereum: { 0: { balance: { $set: undefined } } } } } }))
    expect(wrapper.find(TextField).filter('#amount').prop('helperText')).toEqual('Balance: 0 ETH')
  })
})

describe('RecipientComponent Interactions:', () => {
  let mockUpdateTransferForm
  let mockGoToStep
  beforeEach(() => {
    mockUpdateTransferForm = jest.fn()
    mockGoToStep = jest.fn()
    wrapper = mount(
      <Recipient {...{
        ...initialProps,
        updateTransferForm: mockUpdateTransferForm,
        goToStep: mockGoToStep
      }
      } />
    )
  })

  it('sender input field change', () => {
    wrapper.find(TextField).filter('#sender').props().onChange({ target: { value: mockValidEmail } })
    expect(wrapper.find(TextField).filter('#sender').prop('error')).toEqual(false)

    wrapper.find(TextField).filter('#sender').props().onChange({ target: { value: mockInvalidEmail } })
    expect(mockUpdateTransferForm.mock.calls[1][0].formError.sender).toEqual('Invalid email')
  })

  it('destination input field change', () => {
    wrapper.find(TextField).filter('#destination').props().onChange({ target: { value: mockValidEmail } })
    expect(wrapper.find(TextField).filter('#destination').prop('error')).toEqual(false)

    wrapper.find(TextField).filter('#destination').props().onChange({ target: { value: mockInvalidEmail } })
    expect(mockUpdateTransferForm.mock.calls[1][0].formError.destination).toEqual('Invalid email')
  })

  it('amount input field change (valid)', () => {
    wrapper.find(TextField).filter('#amount').props().onChange({ target: { value: mockValidAmount } })
    expect(wrapper.find(TextField).filter('#amount').prop('error')).toEqual(false)

    // This is for the second check on transferAmount when getTxCost finish
    wrapper.setProps({ actionsPending: { getTxFee: true } })
    wrapper.setProps({
      txFee: { costInBasicUnit: '99999999999999999' },
      actionsPending: { getTxFee: false }
    })
    expect(mockUpdateTransferForm.mock.calls.length).toEqual(2)
  })

  it('amount input field change (large amount)', () => {
    wrapper.find(TextField).filter('#amount').props().onChange({ target: { value: largeAmount } })
    expect(mockUpdateTransferForm.mock.calls[0][0].formError.transferAmount).toEqual('The amount cannot exceed your current balance 0.01')
  })

  it('amount input field change (<0.001)', () => {
    wrapper.find(TextField).filter('#amount').props().onChange({ target: { value: mockInvalidAmount } })
    expect(mockUpdateTransferForm.mock.calls[0][0].formError.transferAmount).toEqual('The amount must be greater than 0.001')
  })

  it('amount input field change (INSUFFICIENT_FUNDS_FOR_TX_FEES) ETH', () => {
    wrapper.setProps({ txFee: { costInBasicUnit: '99999999999999999' } })
    wrapper.find(TextField).filter('#amount').props().onChange({ target: { value: mockInvalidAmountETH } })
    expect(mockUpdateTransferForm.mock.calls[0][0].formError.transferAmount).toEqual('Insufficient funds for paying transaction fees')
  })

  it('amount input field change (INSUFFICIENT_FUNDS_FOR_TX_FEES) DAI', () => {
    wrapper.setProps({
      txFee: { costInBasicUnit: '99999999999999999' },
      cryptoSelection: 'dai'
    })
    wrapper.find(TextField).filter('#amount').props().onChange({ target: { value: mockInvalidAmountETH } })
    expect(mockUpdateTransferForm.mock.calls[0][0].formError.transferAmount).toEqual('Insufficient funds for paying transaction fees')
  })

  it('amount input field change (INSUFFICIENT_FUNDS_FOR_TX_FEES) BTC', () => {
    wrapper.setProps({
      txFee: { costInBasicUnit: '99999999999999999' },
      cryptoSelection: 'bitcoin'
    })
    wrapper.find(TextField).filter('#amount').props().onChange({ target: { value: mockInvalidAmountBTC } })
    expect(mockUpdateTransferForm.mock.calls[0][0].formError.transferAmount).toEqual('Insufficient funds for paying transaction fees')
  })

  it('password input field change', () => {
    wrapper.find(TextField).filter('#password').props().onChange({ target: { value: mockValidPassword } })
    expect(wrapper.find(TextField).filter('#password').prop('error')).toEqual(false)

    wrapper.find(TextField).filter('#password').props().onChange({ target: { value: mockInvalidPassword } })
    expect(mockUpdateTransferForm.mock.calls[1][0].formError.password).toEqual('Length must be greater or equal than 6')
  })

  it('back button', () => {
    wrapper.find(Button).filter('#back').simulate('click')
    expect(mockGoToStep.mock.calls[0][0]).toEqual(-1)
  })

  it('continue', () => {
    wrapper.setProps({
      transferForm: {
        ...initialProps.transferForm,
        sender: mockValidEmail,
        destination: mockValidEmail,
        transferAmount: mockValidAmount,
        password: mockValidPassword
      }
    })
    wrapper.find(Button).filter('#continue').simulate('click')
    expect(mockGoToStep.mock.calls[0][0]).toEqual(1)
  })
})
