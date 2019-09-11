import update from 'immutability-helper'

import ReceiveWalletSelection from '../components/ReceiveWalletSelectionComponent'
import { WalletButton } from '../components/WalletSelectionButtons'
import Button from '@material-ui/core/Button'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

const transfer = {
  cryptoType: 'ethereum'
}
const mockLastUsedAddress = 'e7b7baf2b41c12f9f376443a5bc2cd7870999abc'
const mockWallet = {
  connected: true,
  crypto: {
    ethereum: {
      0: {
        address: 'e7b7baf2b41c61f9f376ae3a5bc2cd78709995a7'
      }
    },
    dai: {
      0: {
        address: 'e7b7baf2b41c61f9f376ae3a5bc2cd78709995a7'
      }
    },
    bitcoin: {
      0: {
        address: 'mtHrY25GUMvSsj9s72BQjPbK5iDvJykGFh'
      }
    }
  }
}
const emptyWallet = {
  connected: false,
  crypto: {}
}
const initialProps = {
  walletType: null,
  wallet: null,
  lastUsedAddressByWalletType: {
    notUsed: false,
    drive: {
      crypto: {}
    },
    metamask: {
      crypto: {}
    },
    ledger: {
      crypto: {}
    },
    metamaskWalletConnect: {
      crypto: {}
    },
    trustWalletConnect: {
      crypto: {}
    },
    coinomiWalletConnect: {
      crypto: {}
    }
  },
  transfer: transfer,
  actionsPending: {
    getLedgerWalletData: false,
    checkWalletConnection: false,
    syncAccountInfo: false,
    updateBtcAccountInfo: false,
    getLastUsedAddress: false
  },
  walletStatus: { disabled: false },
  goToStep: () => {}
}
let wrapper

describe('ReceiveWalletSelectionComponent render', () => {
  beforeEach(() => {
    wrapper = mount(<ReceiveWalletSelection {...initialProps} />)
  })

  afterEach(() => {
    expect(toJson(wrapper.render())).toMatchSnapshot()
  })

  // Receive ETH
  it('receive ETH before select wallet', () => {
    wrapper.setProps({ transfer: { cryptoType: 'ethereum' } })
    expect(
      wrapper
        .find(WalletButton)
        .filter('#drive')
        .prop('disabled')
    ).toEqual(false)
    expect(
      wrapper
        .find(WalletButton)
        .filter('#drive')
        .prop('disabled')
    ).toEqual(false)
    expect(
      wrapper
        .find(WalletButton)
        .filter('#drive')
        .prop('disabled')
    ).toEqual(false)
  })

  it('select drive to receive ETH', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'drive' },
        transfer: { cryptoType: { $set: 'ethereum' } },
        wallet: { $set: mockWallet },
        lastUsedAddressByWalletType: { $set: null }
      })
    )
    expect(wrapper.find(WalletButton).filter(`#drive`)).toHaveLength(1)
    expect(wrapper.find(Typography).someWhere(t => t.text() === 'Drive wallet connected')).toEqual(
      true
    )
    expect(
      wrapper
        .find(Typography)
        .someWhere(t => t.text() === `Wallet address: ${mockWallet.crypto.ethereum[0].address}`)
    ).toEqual(true)
  })

  it('select Metamask to receive ETH', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'metamask' },
        transfer: { cryptoType: { $set: 'ethereum' } },
        wallet: { $set: mockWallet },
        lastUsedAddressByWalletType: { $set: null }
      })
    )
    expect(wrapper.find(WalletButton).filter(`#metamask`)).toHaveLength(1)
    expect(
      wrapper.find(Typography).someWhere(t => t.text() === 'Metamask wallet connected')
    ).toEqual(true)
    expect(
      wrapper
        .find(Typography)
        .someWhere(t => t.text() === `Wallet address: ${mockWallet.crypto.ethereum[0].address}`)
    ).toEqual(true)
  })

  it('use lastUsed Metamask to receive ETH', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'metamask' },
        transfer: { cryptoType: { $set: 'ethereum' } },
        wallet: { $set: { crypto: {} } },
        lastUsedAddressByWalletType: {
          crypto: { $set: { ethereum: [{ address: mockLastUsedAddress }] } }
        }
      })
    )
    expect(wrapper.find(WalletButton).filter(`#metamask`)).toHaveLength(1)
    expect(
      wrapper.find(Typography).someWhere(t => t.text() === 'Last used Metamask Account')
    ).toEqual(true)
  })

  it('select Ledger to receive ETH', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'ledger' },
        transfer: { cryptoType: { $set: 'ethereum' } },
        wallet: { $set: mockWallet },
        lastUsedAddressByWalletType: { $set: null }
      })
    )
    expect(wrapper.find(WalletButton).filter(`#ledger`)).toHaveLength(1)
    expect(wrapper.find(Typography).someWhere(t => t.text() === 'Ledger wallet connected')).toEqual(
      true
    )
    expect(
      wrapper
        .find(Typography)
        .someWhere(t => t.text() === `Wallet address: ${mockWallet.crypto.ethereum[0].address}`)
    ).toEqual(true)
  })

  it('use lastUsed Ledger to receive ETH', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'ledger' },
        transfer: { cryptoType: { $set: 'ethereum' } },
        wallet: { $set: { crypto: {} } },
        lastUsedAddressByWalletType: {
          crypto: { $set: { ethereum: [{ address: mockLastUsedAddress }] } }
        }
      })
    )
    expect(wrapper.find(WalletButton).filter(`#ledger`)).toHaveLength(1)
    expect(wrapper.find(Typography).someWhere(t => t.text() === 'Last used Ledger Device')).toEqual(
      true
    )
  })

  // Receive DAI
  it('receive DAI before select wallet', () => {
    wrapper.setProps({ transfer: { cryptoType: 'dai' } })
    expect(
      wrapper
        .find(WalletButton)
        .filter('#drive')
        .prop('disabled')
    ).toEqual(false)
    expect(
      wrapper
        .find(WalletButton)
        .filter('#metamask')
        .prop('disabled')
    ).toEqual(false)
    expect(
      wrapper
        .find(WalletButton)
        .filter('#ledger')
        .prop('disabled')
    ).toEqual(false)
  })

  it('select drive to receive DAI', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'drive' },
        transfer: { cryptoType: { $set: 'dai' } },
        wallet: { $set: mockWallet },
        lastUsedAddressByWalletType: { $set: null }
      })
    )
    expect(wrapper.find(WalletButton).filter(`#drive`)).toHaveLength(1)
    expect(wrapper.find(Typography).someWhere(t => t.text() === 'Drive wallet connected')).toEqual(
      true
    )
    expect(
      wrapper
        .find(Typography)
        .someWhere(t => t.text() === `Wallet address: ${mockWallet.crypto.dai[0].address}`)
    ).toEqual(true)
  })

  it('select Metamask to receive DAI', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'metamask' },
        transfer: { cryptoType: { $set: 'dai' } },
        wallet: { $set: mockWallet },
        lastUsedAddressByWalletType: { $set: null }
      })
    )
    expect(wrapper.find(WalletButton).filter(`#metamask`)).toHaveLength(1)
    expect(
      wrapper.find(Typography).someWhere(t => t.text() === 'Metamask wallet connected')
    ).toEqual(true)
    expect(
      wrapper
        .find(Typography)
        .someWhere(t => t.text() === `Wallet address: ${mockWallet.crypto.dai[0].address}`)
    ).toEqual(true)
  })

  it('use lastUsed Metamask to receive DAI', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'metamask' },
        transfer: { cryptoType: { $set: 'dai' } },
        wallet: { $set: { crypto: {} } },
        lastUsedAddressByWalletType: {
          crypto: { $set: { dai: [{ address: mockLastUsedAddress }] } }
        }
      })
    )
    expect(wrapper.find(WalletButton).filter(`#metamask`)).toHaveLength(1)
    expect(
      wrapper.find(Typography).someWhere(t => t.text() === 'Last used Metamask Account')
    ).toEqual(true)
  })

  it('select Ledger to receive DAI', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'ledger' },
        transfer: { cryptoType: { $set: 'dai' } },
        wallet: { $set: mockWallet },
        lastUsedAddressByWalletType: { $set: null }
      })
    )
    expect(wrapper.find(WalletButton).filter(`#ledger`)).toHaveLength(1)
    expect(wrapper.find(Typography).someWhere(t => t.text() === 'Ledger wallet connected')).toEqual(
      true
    )
    expect(
      wrapper
        .find(Typography)
        .someWhere(t => t.text() === `Wallet address: ${mockWallet.crypto.dai[0].address}`)
    ).toEqual(true)
  })

  it('use lastUsed Ledger to receive DAI', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'ledger' },
        transfer: { cryptoType: { $set: 'dai' } },
        wallet: { $set: { crypto: {} } },
        lastUsedAddressByWalletType: {
          crypto: { $set: { dai: [{ address: mockLastUsedAddress }] } }
        }
      })
    )
    expect(wrapper.find(WalletButton).filter(`#ledger`)).toHaveLength(1)
    expect(wrapper.find(Typography).someWhere(t => t.text() === 'Last used Ledger Device')).toEqual(
      true
    )
  })

  // Receive BTC
  it('receive BTC before select wallet', () => {
    wrapper.setProps({ transfer: { cryptoType: 'bitcoin' } })
    expect(
      wrapper
        .find(WalletButton)
        .filter('#drive')
        .prop('disabled')
    ).toEqual(false)
    expect(
      wrapper
        .find(WalletButton)
        .filter('#metamask')
        .prop('disabled')
    ).toEqual(true)
    expect(
      wrapper
        .find(WalletButton)
        .filter('#ledger')
        .prop('disabled')
    ).toEqual(false)
  })

  it('select drive to receive BTC', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'drive' },
        transfer: { cryptoType: { $set: 'bitcoin' } },
        wallet: { $set: mockWallet },
        lastUsedAddressByWalletType: { $set: null }
      })
    )
    expect(wrapper.find(WalletButton).filter(`#drive`)).toHaveLength(1)
    expect(wrapper.find(Typography).someWhere(t => t.text() === 'Drive wallet connected')).toEqual(
      true
    )
    expect(
      wrapper
        .find(Typography)
        .someWhere(t => t.text() === `Wallet address: ${mockWallet.crypto.bitcoin[0].address}`)
    ).toEqual(true)
  })

  it('select Ledger to receive BTC', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'ledger' },
        transfer: { cryptoType: { $set: 'bitcoin' } },
        wallet: { $set: mockWallet },
        lastUsedAddressByWalletType: { $set: null }
      })
    )
    expect(wrapper.find(WalletButton).filter(`#ledger`)).toHaveLength(1)
    expect(wrapper.find(Typography).someWhere(t => t.text() === 'Ledger wallet connected')).toEqual(
      true
    )
    expect(
      wrapper
        .find(Typography)
        .someWhere(t => t.text() === `Wallet address: ${mockWallet.crypto.bitcoin[0].address}`)
    ).toEqual(true)
  })

  it('use lastUsed Ledger to receive BTC', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'ledger' },
        transfer: { cryptoType: { $set: 'bitcoin' } },
        wallet: { $set: { crypto: {} } },
        lastUsedAddressByWalletType: {
          crypto: { $set: { bitcoin: [{ address: mockLastUsedAddress }] } }
        }
      })
    )
    expect(wrapper.find(WalletButton).filter(`#ledger`)).toHaveLength(1)
    expect(wrapper.find(Typography).someWhere(t => t.text() === 'Last used Ledger Device')).toEqual(
      true
    )
  })

  // device not connected
  it('device not connected error', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'ledger' },
        transfer: { cryptoType: { $set: 'ethereum' } },
        wallet: { $set: emptyWallet },
        lastUsedAddressByWalletType: { $set: null }
      })
    )
    expect(wrapper.find(Typography).filter('#walletNotConnectedText')).toHaveLength(1)
  })
  // actionsPending
  it('checkWalletConnections', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'metamask' },
        transfer: { cryptoType: { $set: 'ethereum' } },
        actionsPending: { checkWalletConnection: { $set: true } },
        wallet: { $set: emptyWallet },
        lastUsedAddressByWalletType: { $set: null }
      })
    )
    expect(wrapper.find(LinearProgress)).toHaveLength(1)

    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'ledger' },
        transfer: { cryptoType: { $set: 'bitcoin' } },
        actionsPending: { checkWalletConnection: { $set: true } },
        wallet: { $set: emptyWallet },
        lastUsedAddressByWalletType: { $set: null }
      })
    )
    expect(wrapper.find(LinearProgress)).toHaveLength(1)

    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'drive' },
        transfer: { cryptoType: { $set: 'bitcoin' } },
        actionsPending: { checkWalletConnection: { $set: true } },
        wallet: { $set: emptyWallet },
        lastUsedAddressByWalletType: { $set: null }
      })
    )
    expect(wrapper.find(LinearProgress)).toHaveLength(1)
  })
})

describe('ReceiveWalletSelectionComponent interaction', () => {
  beforeEach(() => {
    wrapper = mount(<ReceiveWalletSelection {...initialProps} />)
  })

  it('onWalletSelected', () => {
    const mockOnWalletSelect = jest.fn()
    wrapper.setProps(
      update(initialProps, {
        onWalletSelected: { $set: mockOnWalletSelect }
      })
    )
    wrapper
      .find(WalletButton)
      .at(0)
      .simulate('click')
    expect(mockOnWalletSelect.mock.calls.length).toEqual(1)
  })

  it('continue btn', () => {
    const mockGoToStep = jest.fn()
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'ledger' },
        transfer: { cryptoType: { $set: 'dai' } },
        wallet: { $set: { crypto: {} } },
        lastUsedAddressByWalletType: {
          crypto: { $set: { dai: [{ address: mockLastUsedAddress }] } }
        },
        goToStep: { $set: mockGoToStep }
      })
    )
    wrapper
      .find(Button)
      .filter('#continue')
      .simulate('click')
    expect(mockGoToStep.mock.calls[0][0]).toEqual(1)
  })

  it('cancel btn', () => {
    const mockGoToStep = jest.fn()
    const mockOnWalletSelected = jest.fn()
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'ledger' },
        transfer: { cryptoType: { $set: 'dai' } },
        wallet: { $set: { crypto: {} } },
        lastUsedAddressByWalletType: {
          crypto: { $set: { dai: [{ address: mockLastUsedAddress }] } }
        },
        goToStep: { $set: mockGoToStep },
        onWalletSelected: { $set: mockOnWalletSelected }
      })
    )
    wrapper
      .find(Button)
      .filter('#cancel')
      .simulate('click')
    expect(mockGoToStep.mock.calls[0][0]).toEqual(-2)
    expect(mockOnWalletSelected.mock.calls[0][0]).toEqual(null)
  })

  it('user another address btn', () => {
    const useAnotherAddress = jest.fn()
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'ledger' },
        transfer: { cryptoType: { $set: 'dai' } },
        wallet: { $set: { crypto: {} } },
        lastUsedAddressByWalletType: {
          crypto: { $set: { dai: [{ address: mockLastUsedAddress }] } }
        },
        useAnotherAddress: { $set: useAnotherAddress }
      })
    )
    wrapper
      .find(Grid)
      .filter('#useAnotherAddress')
      .simulate('click')
    expect(useAnotherAddress.mock.calls.length).toEqual(1)
  })
})
