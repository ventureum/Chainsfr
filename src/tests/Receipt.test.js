import React from 'react'
import renderer from 'react-test-renderer'
import { MemoryRouter } from 'react-router-dom'
import moment from 'moment'

import Receipt from '../components/ReceiptComponent'

describe('ReceiptComponent', () => {
  const initialProps = {
    backToHome: () => {},
    cryptoSelection: 'ethereum',
    txCost: {
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

  let createRenderTree = (props) => {
    return renderer
      .create(
        <MemoryRouter>
          <Receipt {...props} />
        </MemoryRouter>
      )
  }

  it('Receipt render:', () => {
    const tree = createRenderTree(initialProps).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
