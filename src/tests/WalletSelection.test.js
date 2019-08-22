import update from 'immutability-helper'

import WalletSelection from '../components/WalletSelectionComponent'
import Radio from '@material-ui/core/Radio'
import Typography from '@material-ui/core/Typography'
import numeral from 'numeral'
import utils from '../utils'
import { getCryptoSymbol, getCryptoDecimals } from '../tokens'
import LinearProgress from '@material-ui/core/LinearProgress'
import ListItem from '@material-ui/core/ListItem'
import Button from '@material-ui/core/Button'

jest.mock('react-router-dom', () => () => ({
  Link: 'Link'
}))

const mockWallet = {
  connected: true,
  crypto: {
    ethereum: {
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
        balance: '0',
        id: '0737b8f5-7f3e-46f8-8489-a60a8b9d3158',
        version: 3
      }
    },
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
  walletType: null,
  currencyAmount: {
    ethereum: '123.23 USD',
    bitcoin: '9999.11 USD',
    dai: '100002.223 USD'
  }
}

let wrapper

describe('WalletSelectionComponent rendering', () => {
  beforeEach(() => {
    wrapper = mount(<WalletSelection {...initialProps} />)
  })

  it('initial render without error', () => {
    expect(toJson(wrapper.render())).toMatchSnapshot()
  })

  // Drive wallet
  it('select drive', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'drive' }
      })
    )
  })

  it('select drive and DAI', () => {
    const walletType = 'drive'
    const cryptoType = 'ethereum'
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: walletType },
        cryptoType: { $set: cryptoType },
        wallet: { $set: mockWallet }
      })
    )
    const balance = `${numeral(
      utils.toHumanReadableUnit(
        mockWallet.crypto[cryptoType][0].balance,
        getCryptoDecimals(cryptoType)
      )
    ).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(
      wrapper
        .find(Radio)
        .filter(`#${cryptoType}`)
        .prop('checked')
    ).toEqual(true)
    expect(
      wrapper
        .find(Typography)
        .filter(`#${cryptoType}Balance`)
        .text()
    ).toEqual(balance)
  })

  it('select drive and DAI', () => {
    const walletType = 'drive'
    const cryptoType = 'dai'
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: walletType },
        cryptoType: { $set: cryptoType },
        wallet: { $set: mockWallet }
      })
    )
    const balance = `${numeral(
      utils.toHumanReadableUnit(
        mockWallet.crypto[cryptoType][0].balance,
        getCryptoDecimals(cryptoType)
      )
    ).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(
      wrapper
        .find(Radio)
        .filter(`#${cryptoType}`)
        .prop('checked')
    ).toEqual(true)
    expect(
      wrapper
        .find(Typography)
        .filter(`#${cryptoType}Balance`)
        .text()
    ).toEqual(balance)
  })

  it('select drive and DAI', () => {
    const walletType = 'drive'
    const cryptoType = 'bitcoin'
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: walletType },
        cryptoType: { $set: cryptoType },
        wallet: { $set: mockWallet }
      })
    )
    const balance = `${numeral(
      utils.toHumanReadableUnit(
        mockWallet.crypto[cryptoType][0].balance,
        getCryptoDecimals(cryptoType)
      )
    ).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(
      wrapper
        .find(Radio)
        .filter(`#${cryptoType}`)
        .prop('checked')
    ).toEqual(true)
    expect(
      wrapper
        .find(Typography)
        .filter(`#${cryptoType}Balance`)
        .text()
    ).toEqual(balance)
  })

  // Metamask
  it('select metamask', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'metamask' }
      })
    )
  })

  it('select metamask and DAI', () => {
    const walletType = 'metamask'
    const cryptoType = 'ethereum'
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: walletType },
        cryptoType: { $set: cryptoType },
        wallet: { $set: mockWallet }
      })
    )
    const balance = `${numeral(
      utils.toHumanReadableUnit(
        mockWallet.crypto[cryptoType][0].balance,
        getCryptoDecimals(cryptoType)
      )
    ).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(
      wrapper
        .find(Radio)
        .filter(`#${cryptoType}`)
        .prop('checked')
    ).toEqual(true)
    expect(
      wrapper
        .find(Typography)
        .filter(`#${cryptoType}Balance`)
        .text()
    ).toEqual(balance)
  })

  it('select metamask and DAI', () => {
    const walletType = 'metamask'
    const cryptoType = 'dai'
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: walletType },
        cryptoType: { $set: cryptoType },
        wallet: { $set: mockWallet }
      })
    )
    const balance = `${numeral(
      utils.toHumanReadableUnit(
        mockWallet.crypto[cryptoType][0].balance,
        getCryptoDecimals(cryptoType)
      )
    ).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(
      wrapper
        .find(Radio)
        .filter(`#${cryptoType}`)
        .prop('checked')
    ).toEqual(true)
    expect(
      wrapper
        .find(Typography)
        .filter(`#${cryptoType}Balance`)
        .text()
    ).toEqual(balance)
  })

  // Ledger
  it('select ledger', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'ledger' }
      })
    )
  })

  it('select ledger and DAI', () => {
    const walletType = 'ledger'
    const cryptoType = 'ethereum'
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: walletType },
        cryptoType: { $set: cryptoType },
        wallet: { $set: mockWallet }
      })
    )
    const balance = `${numeral(
      utils.toHumanReadableUnit(
        mockWallet.crypto[cryptoType][0].balance,
        getCryptoDecimals(cryptoType)
      )
    ).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(
      wrapper
        .find(Radio)
        .filter(`#${cryptoType}`)
        .prop('checked')
    ).toEqual(true)
    expect(
      wrapper
        .find(Typography)
        .filter(`#${cryptoType}Balance`)
        .text()
    ).toEqual(balance)
  })

  it('select ledger and DAI', () => {
    const walletType = 'ledger'
    const cryptoType = 'dai'
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: walletType },
        cryptoType: { $set: cryptoType },
        wallet: { $set: mockWallet }
      })
    )
    const balance = `${numeral(
      utils.toHumanReadableUnit(
        mockWallet.crypto[cryptoType][0].balance,
        getCryptoDecimals(cryptoType)
      )
    ).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(
      wrapper
        .find(Radio)
        .filter(`#${cryptoType}`)
        .prop('checked')
    ).toEqual(true)
    expect(
      wrapper
        .find(Typography)
        .filter(`#${cryptoType}Balance`)
        .text()
    ).toEqual(balance)
  })

  it('select ledger and DAI', () => {
    const walletType = 'ledger'
    const cryptoType = 'bitcoin'
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: walletType },
        cryptoType: { $set: cryptoType },
        wallet: { $set: mockWallet }
      })
    )
    const balance = `${numeral(
      utils.toHumanReadableUnit(
        mockWallet.crypto[cryptoType][0].balance,
        getCryptoDecimals(cryptoType)
      )
    ).format('0.000a')} ${getCryptoSymbol(cryptoType)}`
    expect(
      wrapper
        .find(Radio)
        .filter(`#${cryptoType}`)
        .prop('checked')
    ).toEqual(true)
    expect(
      wrapper
        .find(Typography)
        .filter(`#${cryptoType}Balance`)
        .text()
    ).toEqual(balance)
  })

  it('select ledger and DAI', () => {
    const walletType = 'ledger'
    const cryptoType = 'bitcoin'
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: walletType },
        cryptoType: { $set: cryptoType },
        wallet: { $set: { connected: true, crypto: {} } }
      })
    )
    expect(toJson(wrapper.render())).toMatchSnapshot()
  })

  //  actionPending
  it('checkWalletConnection', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'ledger' },
        cryptoType: { $set: 'bitcoin' },
        actionsPending: { checkWalletConnection: { $set: true } },
        wallet: { $set: emptyWallet }
      })
    )
    expect(wrapper.find(LinearProgress)).toHaveLength(1)
    expect(
      wrapper
        .find(ListItem)
        .filter('#bitcoin')
        .prop('disabled')
    ).toEqual(true)
    expect(
      wrapper
        .find(Button)
        .filter('#continue')
        .prop('disabled')
    ).toEqual(true)
  })

  // device not connected
  it('check Ledger device not connected', () => {
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'ledger' },
        cryptoType: { $set: 'bitcoin' },
        wallet: { $set: emptyWallet }
      })
    )
    expect(wrapper.find(Typography).filter('#walletNotConnectedText')).toHaveLength(1)
  })
})

describe('WalletSelectionComponent interaction', () => {
  beforeEach(() => {
    wrapper = mount(<WalletSelection {...initialProps} />)
  })

  it('onCryptoSelected', () => {
    const mockOnCryptoSelected = jest.fn()
    wrapper.setProps(
      update(initialProps, {
        walletType: { $set: 'ledger' },
        onCryptoSelected: { $set: mockOnCryptoSelected }
      })
    )
    wrapper
      .find(ListItem)
      .at(0)
      .simulate('click')
    expect(mockOnCryptoSelected.mock.calls.length).toEqual(1)
  })
})
