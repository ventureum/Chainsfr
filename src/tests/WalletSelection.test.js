import React from 'react'
import renderer from 'react-test-renderer'
import { MemoryRouter } from 'react-router-dom'
import update from 'immutability-helper'

import WalletSelection from '../components/WalletSelectionComponent'

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
      } },
    dai: {
      0: {
        address: 'e7b7baf2b41c61f9f376ae3a5bc2cd78709995a7',
        balance: '0',
        id: '0737b8f5-7f3e-46f8-8489-a60a8b9d3158',
        version: 3
      } },
    bitcoin: {
      0: {
        address: 'mtHrY25GUMvSsj9s72BQjPbK5iDvJykGFh',
        addresses: [],
        balance: '0',
        ciphertext: '6PYSS2TUay4BfyA3VBzidSmz5GqSbfe2cUoDobWomkL7acsb1AJbGRU6mK'
      }
    }
  }
}

const emptyWallet = {
  connected: false,
  crypto: {}
}

describe('WalletSelection', () => {
  let initialProps = {
    actionsPending: {
      checkWalletConnection: false,
      syncAccountInfo: false,
      updateBtcAccountInfo: false,
      checkCloudWalletConnection: false
    },
    cryptoSelectionPrefilled: undefined,
    cryptoType: null,
    error: '',
    goToStep: () => {},
    handleNext: () => {},
    onCryptoSelected: () => {},
    onWalletSelected: () => {},
    wallet: undefined,
    walletType: null
  }
  let createRenderTree = (props) => {
    return renderer
      .create(
        <MemoryRouter>
          <WalletSelection {...props} />
        </MemoryRouter>
      )
  }

  it('initial render', () => {
    const props = initialProps
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })

  // drive wallet
  it('select drive', () => {
    const props = update(initialProps, { walletType: { $set: 'drive' } })
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('select drive and ETH', () => {
    const props = update(initialProps, {
      walletType: { $set: 'drive' },
      cryptoType: { $set: 'ethereum' },
      wallet: { $set: mockWallet }
    })
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('select drive and DAI', () => {
    const props = update(initialProps, {
      walletType: { $set: 'drive' },
      cryptoType: { $set: 'dai' },
      wallet: { $set: mockWallet }
    })
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('select drive and BTC', () => {
    const props = update(initialProps, {
      walletType: { $set: 'drive' },
      cryptoType: { $set: 'bitcoin' },
      wallet: { $set: mockWallet }
    })
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })

  // Metamask
  it('select metamask', () => {
    const props = update(initialProps, { walletType: { $set: 'metamask' } })
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('select metamask and ETH', () => {
    const props = update(initialProps, {
      walletType: { $set: 'metamask' },
      cryptoType: { $set: 'ethereum' },
      wallet: { $set: mockWallet }
    })
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('select metamask and DAI', () => {
    const props = update(initialProps, {
      walletType: { $set: 'metamask' },
      cryptoType: { $set: 'dai' },
      wallet: { $set: mockWallet }
    })
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })

  // ledger
  it('select ledger', () => {
    const props = update(initialProps, { walletType: { $set: 'ledger' } })
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('select ledger and ETH', () => {
    const props = update(initialProps, {
      walletType: { $set: 'ledger' },
      cryptoType: { $set: 'ethereum' },
      wallet: { $set: mockWallet }
    })
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('select ledger and DAI', () => {
    const props = update(initialProps, {
      walletType: { $set: 'ledger' },
      cryptoType: { $set: 'dai' },
      wallet: { $set: mockWallet }
    })
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('select ledger and BTC', () => {
    const props = update(initialProps, {
      walletType: { $set: 'ledger' },
      cryptoType: { $set: 'bitcoin' },
      wallet: { $set: mockWallet }
    })
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })

  // actionPending
  it('checkWalletConnection', () => {
    const props = update(initialProps, {
      walletType: { $set: 'ledger' },
      cryptoType: { $set: 'bitcoin' },
      actionsPending: { checkWalletConnection: { $set: true } },
      wallet: { $set: emptyWallet }
    })
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('syncAccountInfo', () => {
    const props = update(initialProps, {
      walletType: { $set: 'ledger' },
      cryptoType: { $set: 'bitcoin' },
      actionsPending: { syncAccountInfo: { $set: true } },
      wallet: { $set: emptyWallet }
    })
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('updateBtcAccountInfo', () => {
    const props = update(initialProps, {
      walletType: { $set: 'ledger' },
      cryptoType: { $set: 'bitcoin' },
      actionsPending: { updateBtcAccountInfo: { $set: true } },
      wallet: { $set: emptyWallet }
    })
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('checkCloudWalletConnection', () => {
    const props = update(initialProps, {
      walletType: { $set: 'ledger' },
      cryptoType: { $set: 'bitcoin' },
      actionsPending: { checkCloudWalletConnection: { $set: true } },
      wallet: { $set: emptyWallet }
    })
    const tree = createRenderTree(props).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
