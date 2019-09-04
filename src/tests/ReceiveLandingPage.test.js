import ReceiveLandingPage from '../components/ReceiveLandingPageComponent'

import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import MuiLink from '@material-ui/core/Link'
import update from 'immutability-helper'

jest.mock('react-router-dom', () => () => ({
  Link: 'Link'
}))

const sendTimestamp = 'May 23rd 2019, 16:25:06'
const receiveTimestamp = 'May 23rd 2019, 16:49:07'
const cancelTimestamp = 'May 23rd 2019, 16:50:07'
const transfer = {
  cancelTimestamp: null,
  cancelTxHash: null,
  cancelTxState: null,
  cryptoType: 'ethereum',
  destination: 'clzhong@ventureum.io',
  receiveTimestamp: null,
  receiveTxHash: null,
  receiveTxState: null,
  receivingId: '8a11e5e9-5f59-45ee-8301-307ea69a6e48',
  sendTimestamp: sendTimestamp,
  sendTxHash: '0x6cc3dac8a4df6e27d43701aea5223ae3a56414c564d9764b96dfe855b0120c34',
  sendTxState: 'Confirmed',
  sender: 'clzhong@ventureum.io',
  transferId: null,
  transferAmount: '0.001'
}

const initialProps = {
  onLogin: () => {},
  getTransfe: () => {},
  goToStep: () => {},
  transfer: transfer,
  isAuthenticated: false,
  currency: 'USD',
  currencyAmount: {
    transferAmount: '100.2 USD'
  },
  actionsPending: {
    getTransfer: false
  }
}

let wrapper

describe('ReceiveLandingPageComponent render', () => {
  beforeEach(() => {
    wrapper = mount(<ReceiveLandingPage {...initialProps} />)
  })

  afterEach(() => {
    expect(toJson(wrapper.render())).toMatchSnapshot()
  })

  it('Logined, not received', () => {
    wrapper.setProps({ isAuthenticated: true })
    expect(wrapper.find(Button).filter('#accept')).toHaveLength(1)
  })

  it('Not logined, received', () => {
    wrapper.setProps(
      update(
        initialProps,
        { transfer:
          {
            receiveTxHash: { $set: '0xa2773cea9c23c1de5527b1544c2e64db29fdc4ffe9cce5dc2ccdb1f3179089a6' }
          },
        receiveTime: { $set: receiveTimestamp }
        })
    )
    expect(wrapper.find(MuiLink).props().children).toEqual('Check transaction status')
    expect(wrapper.find(Typography).someWhere(n => (n.text() === receiveTimestamp))).toEqual(true)
  })

  it('logined, received', () => {
    wrapper.setProps(
      update(
        initialProps,
        { transfer: {
          receiveTxHash: { $set: '0xa2773cea9c23c1de5527b1544c2e64db29fdc4ffe9cce5dc2ccdb1f3179089a6' }
        },
        isAuthenticated: { $set: true },
        receiveTime: { $set: receiveTimestamp }
        })
    )
    expect(wrapper.find(MuiLink).props().children).toEqual('Check transaction status')
    expect(wrapper.find(Typography).someWhere(n => (n.text() === receiveTimestamp))).toEqual(true)
  })

  it('Not logined, cancelled', () => {
    wrapper.setProps({ isAuthenticated: true })

    wrapper.setProps(
      update(
        initialProps,
        { transfer: {
          cancelTxHash: { $set: '0xa2773cea9c23c1de5527b1544c2e64db29fdc4ffe9cce5dc2ccdb1f3179089a6' }
        },
        cancelTime: { $set: cancelTimestamp }
        })
    )
    expect(wrapper.find(MuiLink).props().children).toEqual('Check transaction status')
    expect(wrapper.find(Typography).someWhere(n => (n.text() === 'Transfer has been cancelled'))).toEqual(true)
    expect(wrapper.find(Typography).someWhere(n => (n.text() === cancelTimestamp))).toEqual(true)
  })

  it('Logined, cancelled', () => {
    wrapper.setProps({ isAuthenticated: true })

    wrapper.setProps(
      update(
        initialProps,
        { transfer: {
          cancelTxHash: { $set: '0xa2773cea9c23c1de5527b1544c2e64db29fdc4ffe9cce5dc2ccdb1f3179089a6' }
        },
        cancelTime: { $set: cancelTimestamp },
        isAuthenticated: { $set: true }
        })
    )
    expect(wrapper.find(MuiLink).props().children).toEqual('Check transaction status')
    expect(wrapper.find(Typography).someWhere(n => (n.text() === 'Transfer has been cancelled'))).toEqual(true)
    expect(wrapper.find(Typography).someWhere(n => (n.text() === cancelTimestamp))).toEqual(true)
  })

  it('No transfer', () => {
    wrapper.setProps(update(initialProps, {
      transfer: { $set: null }
    }))
    expect(wrapper.find(CircularProgress)).toHaveLength(1)
  })

  it('getTransfer pending', () => {
    wrapper.setProps(update(initialProps, {
      actionsPending: { getTransfer: { $set: true } },
      transfer: { $set: null }
    }))
    expect(wrapper.find(CircularProgress)).toHaveLength(1)
  })
})

describe('ReceiveLandingPageComponent interaction', () => {
  beforeEach(() => {
    wrapper = mount(<ReceiveLandingPage {...initialProps} />)
  })

  it('Logined, accept btn', () => {
    const mockCallback = jest.fn()
    wrapper.setProps({
      isAuthenticated: true,
      goToStep: mockCallback
    })
    wrapper.find(Button).filter('#accept').simulate('click')
    expect(mockCallback.mock.calls.length).toEqual(1)
  })
})
