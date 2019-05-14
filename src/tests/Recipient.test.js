import React from 'react'
import renderer from 'react-test-renderer'
import update from 'immutability-helper'

import Recipient from '../components/RecipientComponent'

const mockWallet = {
  connected: true,
  crypto: {
    ethereum:
    {
      0: {
        address: 'e7b7baf2b41c61f9f376ae3a5bc2cd78709995a7',
        balance: '10000000000000000',
        id: '0737b8f5-7f3e-46f8-8489-a60a8b9d3158',
        version: 3
      }
    },
    dai: {
      0: {
        address: 'e7b7baf2b41c61f9f376ae3a5bc2cd78709995a7',
        balance: '10000000000000000',
        id: '0737b8f5-7f3e-46f8-8489-a60a8b9d3158',
        version: 3
      }
    },
    bitcoin: {
      0: {
        address: 'mtHrY25GUMvSsj9s72BQjPbK5iDvJykGFh',
        addresses: [],
        balance: '34432784',
        ciphertext: '6PYSS2TUay4BfyA3VBzidSmz5GqSbfe2cUoDobWomkL7acsb1AJbGRU6mK'
      }
    }
  }
}

const mockValidEmail = 'abc@gmail.com'
const mockInvalidEmail = 'abccom'
const mockValidAmount = '0.001'
const mockInvalidAmountETH = '0.1'
const mockInvalidAmountBTC = '0.344'
const largeAmount = '100000'
const mockInvalidAmount = '0.0001'
const mockValidPassword = '123456'
const mockInvalidPassword = '123'

describe('RecipientComponent', () => {
  let initialProps = {
    updateTransferForm: () => {},
    generateSecurityAnswer: () => {},
    clearSecurityAnswer: () => {},
    goToStep: () => {},
    getTxCost: () => {},
    cryptoSelection: 'ethereum',
    walletSelection: 'metamask',
    transferForm: {
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
    },
    wallet: mockWallet,
    txCost: {},
    actionsPending: {
      getTxCost: false
    }
  }
  let createRenderTree = (props) => {
    return renderer
      .create(
        <Recipient {...props} />
      )
  }

  it('Ethereum', () => {
    // initial render
    let props = initialProps
    let tree = createRenderTree(props)
    expect(tree.toJSON()).toMatchSnapshot()

    // valid inputs
    props = update(props, { transferForm: { sender: { $set: mockValidEmail } } })
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()

    props = update(props, { transferForm: { destination: { $set: mockValidEmail } } })
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()

    props = update(props, { transferForm: { transferAmount: { $set: mockValidAmount } } })
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()

    props = update(props, { transferForm: { password: { $set: mockValidPassword } } })
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()

    // invalid inputs:
    props = update(
      props,
      { transferForm: {
        sender: { $set: mockInvalidEmail },
        formError: { sender: { $set: 'Invalid email' } }
      } })
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()

    props = update(
      props,
      { transferForm: {
        sender: { $set: mockInvalidEmail },
        formError: { sender: { $set: 'Invalid email' } }
      } })
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()

    props = update(
      props,
      { transferForm: {
        transferAmount: { $set: mockInvalidAmountETH },
        formError: { transferAmount: { $set: 'Insufficient funds for paying transaction fees' } }
      } }
    )
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()

    props = update(
      props,
      { transferForm: {
        transferAmount: { $set: largeAmount },
        formError: { transferAmount: { $set: `The amount cannot exceed your current balance ${mockInvalidAmountETH}` } }
      } }
    )
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()

    props = update(
      props,
      { transferForm: {
        transferAmount: { $set: mockInvalidAmount },
        formError: { transferAmount: { $set: 'The amount must be greater than 0.001' } }
      } }
    )
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()

    props = update(
      props,
      { transferForm: {
        password: { $set: mockInvalidPassword },
        formError: { password: { $set: 'Length must be greater or equal than 6' } }
      } })
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()
  })

  // Only transferAmount need to be retested
  it('Dai', () => {
    let props = update(initialProps, { cryptoSelection: { $set: 'dai' } })
    let tree = createRenderTree(props)
    expect(tree.toJSON()).toMatchSnapshot()

    props = update(props, { transferForm: { transferAmount: { $set: mockValidAmount } } })
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()

    // invalid inputs:
    props = update(
      props,
      { transferForm: {
        transferAmount: { $set: mockInvalidAmountETH },
        formError: { transferAmount: { $set: 'Insufficient funds for paying transaction fees' } }
      } }
    )
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()

    props = update(
      props,
      { transferForm: {
        transferAmount: { $set: largeAmount },
        formError: { transferAmount: { $set: `The amount cannot exceed your current balance ${mockInvalidAmountETH}` } }
      } }
    )
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()

    props = update(
      props,
      { transferForm: {
        transferAmount: { $set: mockInvalidAmount },
        formError: { transferAmount: { $set: 'The amount must be greater than 0.001' } }
      } }
    )
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()
  })

  // Only transferAmount need to be retested
  it('Bitcoin', () => {
    let props = update(initialProps, { cryptoSelection: { $set: 'bitcoin' } })
    let tree = createRenderTree(props)
    expect(tree.toJSON()).toMatchSnapshot()

    // valid inputs
    props = update(props, { transferForm: { transferAmount: { $set: mockValidAmount } } })
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()

    // invalid inputs:
    props = update(
      props,
      { transferForm: {
        transferAmount: { $set: mockInvalidAmountBTC },
        formError: { transferAmount: { $set: 'Insufficient funds for paying transaction fees' } }
      } }
    )
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()

    props = update(
      props,
      { transferForm: {
        transferAmount: { $set: largeAmount },
        formError: { transferAmount: { $set: `The amount cannot exceed your current balance ${mockInvalidAmountBTC}` } }
      } }
    )
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()

    props = update(
      props,
      { transferForm: {
        transferAmount: { $set: mockInvalidAmount },
        formError: { transferAmount: { $set: 'The amount must be greater than 0.001' } }
      } }
    )
    tree.update(<Recipient {...props} />)
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
