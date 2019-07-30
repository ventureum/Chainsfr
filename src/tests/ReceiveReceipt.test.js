import moment from 'moment'
import Button from '@material-ui/core/Button'
import update from 'immutability-helper'
import Typography from '@material-ui/core/Typography'
import url from '../url'
import MuiLink from '@material-ui/core/Link'

import ReceiveReceipt from '../components/ReceiveReceiptComponent'

const initialProps = {
  backToHome: () => {},
  cryptoSelection: 'ethereum',
  txFee: {
    costInBasicUnit: '21000000000000',
    costInStandardUnit: '0.000021',
    gas: '21000',
    price: '1000000000'
  },
  receipt: {
    cryptoType: 'ethereum',
    destination: 'abc@gmail.com',
    receiveTimestamp: '1558022548',
    receiveTxHash: '0xe1d591e4d59057550d4f41abd066b211c547c7ae643b9da1de2cc7fbb2659ce9',
    sender: 'abc@gmail.com',
    receivingId: 'e1981151-b951-467f-81e4-e9f87dfa44a8',
    transferAmount: '0.001'
  },
  password: '123456',
  receiveTime: moment.unix('1558022548').utc().format('MMM Do YYYY, HH:mm:ss'),
  currencyAmount: {
    transferAmount: '100.2 USD',
    receiveAmount: '10.44 USD',
    txFee: '2.1 USD'
  },
  receiveAmount: '12333'
}

jest.mock('react-router-dom', () => () => ({
  Link: 'Link'
}))

let wrapper
describe('ReceiptComponent render:', () => {
  beforeEach(() => {
    wrapper = mount(
      <ReceiveReceipt {...initialProps} />
    )
  })

  afterEach(() => {
    expect(toJson(wrapper.render())).toMatchSnapshot()
  })

  it('Receipt render:', () => {
    expect(wrapper.find(Typography).filter('#receiveAmount').text()).toEqual(`${initialProps.receiveAmount} ETH`)
  })

  it('ERC20 render:', () => {
    wrapper.setProps({ receipt: { ...initialProps.receipt, cryptoType: 'dai' } })
    expect(wrapper.find(Typography).filter('#receiveAmount').text()).toEqual(`${initialProps.receiveAmount} DAI`)
  })

  it('bitcoin render', () => {
    const { receipt } = initialProps
    wrapper.setProps({ receipt: { ...initialProps.receipt, cryptoType: 'bitcoin' } })
    expect(wrapper.find(Typography).filter('#receiveAmount').text()).toEqual(`${initialProps.receiveAmount} BTC`)
    expect(wrapper.find(MuiLink).someWhere(m => (m.prop('href') === url.getBtcExplorerTx(receipt.receiveTxHash))))
      .toEqual(true)
  })
})

describe('ReceiptComponent interactions:', () => {
  beforeEach(() => {
    wrapper = mount(
      <ReceiveReceipt {...initialProps} />
    )
  })

  it('Back to home btn', () => {
    let mockBackToHome = jest.fn()
    wrapper.setProps(update(initialProps, {
      backToHome: mockBackToHome
    })
    )
    wrapper.find(Button).filter('#back').simulate('click')
    expect(mockBackToHome.mock.calls.length).toEqual(1)
  })
})
