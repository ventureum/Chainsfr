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
const largeAmount = '100000'
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
  handleTransferFormChange: () => {},
  validateForm: jest.fn(),
  balanceAmount: '0.000',
  balanceCurrencyAmount: '2323.2 USD',
  currency: 'USD',
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
    expect(wrapper.find(TextField).filter('#cryptoAmount').prop('value')).toEqual(mockValidAmount)
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
    expect(wrapper.find(TextField).filter('#cryptoAmount').prop('helperText')).toEqual(errorMsg)
    expect(wrapper.find(TextField).filter('#password').prop('error')).toEqual(true)
    expect(wrapper.find(Button).filter('#continue').prop('disabled')).toEqual(true)
  })

  // balance does not exist
  it('balance undefined', () => {
    wrapper.setProps(update(initialProps, { wallet: { crypto: { ethereum: { 0: { balance: { $set: undefined } } } } } }))
    expect(wrapper.find(TextField).filter('#cryptoAmount').prop('helperText')).toEqual('Balance: 0.000 ETH')
  })
})

describe('RecipientComponent Interactions:', () => {
  let mockUpdateTransferForm
  let mockGoToStep
  let mockHandleTransferFormChangeEvent
  let mockHandleTransferFormChangeName
  beforeEach(() => {
    mockUpdateTransferForm = jest.fn()
    mockGoToStep = jest.fn()
    mockHandleTransferFormChangeEvent = {
      sender: jest.fn((event) => {}),
      destination: jest.fn((event) => {}),
      transferCurrencyAmount: jest.fn((event) => {}),
      transferAmount: jest.fn((event) => {}),
      password: jest.fn((event) => {})
    }
    mockHandleTransferFormChangeName = jest.fn((name) => {
      return mockHandleTransferFormChangeEvent[name]
    })
    wrapper = mount(
      <Recipient {...{
        ...initialProps,
        updateTransferForm: mockUpdateTransferForm,
        handleTransferFormChange: mockHandleTransferFormChangeName,
        goToStep: mockGoToStep
      }
      } />
    )
  })

  it('sender input field change', () => {
    const event = { target: { value: mockValidEmail } }
    wrapper.find(TextField).filter('#sender').props().onChange(event)
    expect(mockHandleTransferFormChangeEvent.sender.mock.calls[0][0]).toEqual(event)
  })

  it('destination input field change', () => {
    const event = { target: { value: mockValidEmail } }
    wrapper.find(TextField).filter('#destination').props().onChange(event)
    expect(mockHandleTransferFormChangeEvent.destination.mock.calls[0][0]).toEqual(event)
  })

  it('cryptoAmount input field change (valid)', () => {
    const event = { target: { value: mockValidAmount } }
    wrapper.find(TextField).filter('#cryptoAmount').props().onChange(event)
    expect(wrapper.find(TextField).filter('#cryptoAmount').prop('error')).toEqual(false)

    // This is for the second check on transferAmount when getTxCost finish
    wrapper.setProps({ actionsPending: { getTxFee: true } })
    wrapper.setProps({
      txFee: { costInBasicUnit: '99999999999999999' },
      actionsPending: { getTxFee: false }
    })

    expect(mockHandleTransferFormChangeEvent.transferAmount.mock.calls[0][0]).toEqual(event)
  })

  it('password input field change', () => {
    const event = { target: { value: mockValidPassword } }
    wrapper.find(TextField).filter('#password').props().onChange(event)
    expect(mockHandleTransferFormChangeEvent.password.mock.calls[0][0]).toEqual(event)
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
      },
      validateForm: jest.fn(() => true) // form validation passed
    })
    wrapper.find(Button).filter('#continue').simulate('click')
    expect(mockGoToStep.mock.calls[0][0]).toEqual(1)
  })
})
