import moment from 'moment'
import Button from '@material-ui/core/Button'
import update from 'immutability-helper'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Tooltip from '@material-ui/core/Tooltip'

import Receipt from '../components/ReceiptComponent'

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
    sendTimestamp: '1558022548',
    sendTxHash: '0xe1d591e4d59057550d4f41abd066b211c547c7ae643b9da1de2cc7fbb2659ce9',
    sender: 'abc@gmail.com',
    sendingId: 'e1981151-b951-467f-81e4-e9f87dfa44a8',
    transferAmount: '0.001'
  },
  password: '123456',
  sendTime: moment.unix('1558022548').utc().format('MMM Do YYYY, HH:mm:ss')
}

jest.mock('react-router-dom', () => () => ({
  Link: 'Link'
}))

let wrapper
describe('ReceiptComponent render:', () => {
  beforeEach(() => {
    wrapper = mount(
      <Receipt {...initialProps} />
    )
  })

  it('Receipt render:', () => {
    expect(toJson(wrapper.render())).toMatchSnapshot()
  })
})

describe('ReceiptComponent interactions:', () => {
  beforeEach(() => {
    wrapper = mount(
      <Receipt {...initialProps} />
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

  it('copy password', () => {
    // Next line is necessary to access state
    // https://github.com/airbnb/enzyme/issues/431#issuecomment-362318989
    wrapper = mount(shallow(<Receipt {...initialProps} />).get(0))

    wrapper.find(CopyToClipboard).props().onCopy()
    // force update
    wrapper.update()
    expect(wrapper.state('copied')).toEqual(true)
    expect(wrapper.find(Tooltip).prop('open')).toEqual(true)
  })
})
