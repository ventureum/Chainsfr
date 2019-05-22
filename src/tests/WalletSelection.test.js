import update from 'immutability-helper'

import WalletSelection from '../components/WalletSelectionComponent'
import SquareButton from '../components/SquareButtonComponent'
import Radio from '@material-ui/core/Radio'
import Typography from '@material-ui/core/Typography'
import numeral from 'numeral'
import utils from '../utils'
import { getCryptoSymbol, getCryptoDecimals } from '../tokens'
import LinearProgress from '@material-ui/core/LinearProgress'
import ListItem from '@material-ui/core/ListItem'
import Button from '@material-ui/core/Button'
import ErrorIcon from '@material-ui/icons/Error'

jest.mock('react-router-dom', () => () => ({
  Link: 'Link'
}))

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

let wrapper

describe('WalletSelectionComponent rendering', () => {
  beforeEach(() => {
    wrapper = mount(
      <WalletSelection {...initialProps} />
    )
  })

  it('initial render without error', () => {
    expect(toJson(wrapper.render())).toMatchSnapshot()
  })

  // Drive wallet
  it('select drive', () => {
    wrapper.setProps(update(initialProps, {
      walletType: { $set: 'drive' }
    }))
    expect(wrapper.find(SquareButton).filter('#drive').prop('selected')).toEqual(true)
  })

  it('select drive and DAI', () => {
    const walletType = 'drive'
    const cryptoType = 'ethereum'
    wrapper.setProps(update(initialProps, {
      walletType: { $set: walletType },
      cryptoType: { $set: cryptoType },
      wallet: { $set: mockWallet }
    }
    ))
    const balance = `${numeral(utils.toHumanReadableUnit(mockWallet.crypto[cryptoType][0].balance, getCryptoDecimals(cryptoType))).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(wrapper.find(SquareButton).filter(`#${walletType}`).prop('selected')).toEqual(true)
    expect(wrapper.find(Radio).filter(`#${cryptoType}`).prop('checked')).toEqual(true)
    expect(wrapper.find(Typography).filter(`#${cryptoType}Balance`).text()).toEqual(balance)
  })

  it('select drive and DAI', () => {
    const walletType = 'drive'
    const cryptoType = 'dai'
    wrapper.setProps(update(initialProps, {
      walletType: { $set: walletType },
      cryptoType: { $set: cryptoType },
      wallet: { $set: mockWallet }
    }
    ))
    const balance = `${numeral(utils.toHumanReadableUnit(mockWallet.crypto[cryptoType][0].balance, getCryptoDecimals(cryptoType))).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(wrapper.find(SquareButton).filter(`#${walletType}`).prop('selected')).toEqual(true)
    expect(wrapper.find(Radio).filter(`#${cryptoType}`).prop('checked')).toEqual(true)
    expect(wrapper.find(Typography).filter(`#${cryptoType}Balance`).text()).toEqual(balance)
  })

  it('select drive and DAI', () => {
    const walletType = 'drive'
    const cryptoType = 'bitcoin'
    wrapper.setProps(update(initialProps, {
      walletType: { $set: walletType },
      cryptoType: { $set: cryptoType },
      wallet: { $set: mockWallet }

    }
    ))
    const balance = `${numeral(utils.toHumanReadableUnit(mockWallet.crypto[cryptoType][0].balance, getCryptoDecimals(cryptoType))).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(wrapper.find(SquareButton).filter(`#${walletType}`).prop('selected')).toEqual(true)
    expect(wrapper.find(Radio).filter(`#${cryptoType}`).prop('checked')).toEqual(true)
    expect(wrapper.find(Typography).filter(`#${cryptoType}Balance`).text()).toEqual(balance)
  })

  // Metamask
  it('select metamask', () => {
    wrapper.setProps(update(initialProps, {
      walletType: { $set: 'metamask' }
    }))
    expect(wrapper.find(SquareButton).filter('#metamask').prop('selected')).toEqual(true)
  })

  it('select metamask and DAI', () => {
    const walletType = 'metamask'
    const cryptoType = 'ethereum'
    wrapper.setProps(update(initialProps, {
      walletType: { $set: walletType },
      cryptoType: { $set: cryptoType },
      wallet: { $set: mockWallet }
    }))
    const balance = `${numeral(utils.toHumanReadableUnit(mockWallet.crypto[cryptoType][0].balance, getCryptoDecimals(cryptoType))).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(wrapper.find(SquareButton).filter(`#${walletType}`).prop('selected')).toEqual(true)
    expect(wrapper.find(Radio).filter(`#${cryptoType}`).prop('checked')).toEqual(true)
    expect(wrapper.find(Typography).filter(`#${cryptoType}Balance`).text()).toEqual(balance)
  })

  it('select metamask and DAI', () => {
    const walletType = 'metamask'
    const cryptoType = 'dai'
    wrapper.setProps(update(initialProps, {
      walletType: { $set: walletType },
      cryptoType: { $set: cryptoType },
      wallet: { $set: mockWallet }
    }))
    const balance = `${numeral(utils.toHumanReadableUnit(mockWallet.crypto[cryptoType][0].balance, getCryptoDecimals(cryptoType))).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(wrapper.find(SquareButton).filter(`#${walletType}`).prop('selected')).toEqual(true)
    expect(wrapper.find(Radio).filter(`#${cryptoType}`).prop('checked')).toEqual(true)
    expect(wrapper.find(Typography).filter(`#${cryptoType}Balance`).text()).toEqual(balance)
  })

  // Ledger
  it('select ledger', () => {
    wrapper.setProps(update(initialProps, {
      walletType: { $set: 'ledger' }
    }
    ))
    expect(wrapper.find(SquareButton).filter('#ledger').prop('selected')).toEqual(true)
  })

  it('select ledger and DAI', () => {
    const walletType = 'ledger'
    const cryptoType = 'ethereum'
    wrapper.setProps(update(initialProps, {
      walletType: { $set: walletType },
      cryptoType: { $set: cryptoType },
      wallet: { $set: mockWallet }
    }))
    const balance = `${numeral(utils.toHumanReadableUnit(mockWallet.crypto[cryptoType][0].balance, getCryptoDecimals(cryptoType))).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(wrapper.find(SquareButton).filter(`#${walletType}`).prop('selected')).toEqual(true)
    expect(wrapper.find(Radio).filter(`#${cryptoType}`).prop('checked')).toEqual(true)
    expect(wrapper.find(Typography).filter(`#${cryptoType}Balance`).text()).toEqual(balance)
  })

  it('select ledger and DAI', () => {
    const walletType = 'ledger'
    const cryptoType = 'dai'
    wrapper.setProps(update(initialProps, {
      walletType: { $set: walletType },
      cryptoType: { $set: cryptoType },
      wallet: { $set: mockWallet }
    }))
    const balance = `${numeral(utils.toHumanReadableUnit(mockWallet.crypto[cryptoType][0].balance, getCryptoDecimals(cryptoType))).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(wrapper.find(SquareButton).filter(`#${walletType}`).prop('selected')).toEqual(true)
    expect(wrapper.find(Radio).filter(`#${cryptoType}`).prop('checked')).toEqual(true)
    expect(wrapper.find(Typography).filter(`#${cryptoType}Balance`).text()).toEqual(balance)
  })

  it('select ledger and DAI', () => {
    const walletType = 'ledger'
    const cryptoType = 'bitcoin'
    wrapper.setProps(update(initialProps, {
      walletType: { $set: walletType },
      cryptoType: { $set: cryptoType },
      wallet: { $set: mockWallet }
    }))
    const balance = `${numeral(utils.toHumanReadableUnit(mockWallet.crypto[cryptoType][0].balance, getCryptoDecimals(cryptoType))).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(wrapper.find(SquareButton).filter(`#${walletType}`).prop('selected')).toEqual(true)
    expect(wrapper.find(Radio).filter(`#${cryptoType}`).prop('checked')).toEqual(true)
    expect(wrapper.find(Typography).filter(`#${cryptoType}Balance`).text()).toEqual(balance)
  })

  it('select ledger and DAI', () => {
    const walletType = 'ledger'
    const cryptoType = 'bitcoin'
    wrapper.setProps(update(initialProps, {
      walletType: { $set: walletType },
      cryptoType: { $set: cryptoType },
      wallet: { $set: { connected: true, crypto: {} } }
    }))
    expect(toJson(wrapper.render())).toMatchSnapshot()
  })

  //  actionPending
  it('checkWalletConnection', () => {
    wrapper.setProps(update(initialProps, {
      walletType: { $set: 'ledger' },
      cryptoType: { $set: 'bitcoin' },
      actionsPending: { checkWalletConnection: { $set: true } },
      wallet: { $set: emptyWallet }
    }))
    expect(wrapper.find(LinearProgress)).toHaveLength(1)
    expect(wrapper.find(ListItem).filter('#bitcoin').prop('disabled')).toEqual(true)
    expect(wrapper.find(Button).filter('#continue').prop('disabled')).toEqual(true)
  })

  it('syncAccountInfo', () => {
    wrapper.setProps(update(initialProps, {
      walletType: { $set: 'ledger' },
      cryptoType: { $set: 'bitcoin' },
      actionsPending: { syncAccountInfo: { $set: true } },
      wallet: { $set: mockWallet }
    }))
    expect(wrapper.find(LinearProgress)).toHaveLength(1)
    expect(wrapper.find(Typography).filter('#synchronizeAccInfo').text()).toEqual('Synchronizing Account Info')
    expect(wrapper.find(ListItem).filter('#bitcoin').prop('disabled')).toEqual(true)
    expect(wrapper.find(Button).filter('#continue').prop('disabled')).toEqual(true)
  })

  it('updateBtcAccountInfo', () => {
    wrapper.setProps(update(initialProps, {
      walletType: { $set: 'ledger' },
      cryptoType: { $set: 'bitcoin' },
      actionsPending: { updateBtcAccountInfo: { $set: true } },
      wallet: { $set: mockWallet }
    }))
    expect(wrapper.find(LinearProgress)).toHaveLength(1)
    expect(wrapper.find(Typography).filter('#updateAccInfo').text()).toEqual('Updating Acoount Info')
    expect(wrapper.find(ListItem).filter('#bitcoin').prop('disabled')).toEqual(true)
    expect(wrapper.find(Button).filter('#continue').prop('disabled')).toEqual(true)
  })

  it('checkCloudWalletConnection', () => {
    wrapper.setProps(update(initialProps, {
      walletType: { $set: 'ledger' },
      cryptoType: { $set: 'bitcoin' },
      actionsPending: { checkCloudWalletConnection: { $set: true } },
      wallet: { $set: emptyWallet }
    }))
    expect(wrapper.find(LinearProgress)).toHaveLength(1)
  })

  // device not connected
  it('checkCloudWalletConnection', () => {
    wrapper.setProps(update(initialProps, {
      walletType: { $set: 'ledger' },
      cryptoType: { $set: 'bitcoin' },
      wallet: { $set: emptyWallet }
    }))
    expect(wrapper.find(ErrorIcon)).toHaveLength(1)
    expect(wrapper.find(Typography).filter('#walletNotConnectedText')).toHaveLength(1)
  })
})

describe('WalletSelectionComponent interaction', () => {
  beforeEach(() => {
    wrapper = mount(
      <WalletSelection {...initialProps} />
    )
  })

  it('onWalletSelected', () => {
    const mockOnWalletSelect = jest.fn()
    wrapper.setProps(update(initialProps, {
      onWalletSelected: { $set: mockOnWalletSelect }
    }))
    wrapper.find(SquareButton).at(0).simulate('click')
    expect(mockOnWalletSelect.mock.calls.length).toEqual(1)
  })

  it('onCryptoSelected', () => {
    const mockOnCryptoSelected = jest.fn()
    wrapper.setProps(update(initialProps, {
      walletType: { $set: 'ledger' },
      onCryptoSelected: { $set: mockOnCryptoSelected }
    }))
    wrapper.find(ListItem).at(0).simulate('click')
    expect(mockOnCryptoSelected.mock.calls.length).toEqual(1)
  })
})
