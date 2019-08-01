import React, { Component } from 'react'
import { connect } from 'react-redux'
import Recipient from '../components/RecipientComponent'
import { updateTransferForm, generateSecurityAnswer, clearSecurityAnswer } from '../actions/formActions'
import { goToStep } from '../actions/navigationActions'
import update from 'immutability-helper'
import validator from 'validator'
import BN from 'bn.js'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { getTxFee } from '../actions/transferActions'
import utils from '../utils'
import { getCryptoDecimals } from '../tokens'
import WalletUtils from '../wallets/utils'

type Props = {
  updateTransferForm: Function,
  generateSecurityAnswer: Function,
  clearSecurityAnswer: Function,
  goToStep: Function,
  cryptoSelection: string,
  walletSelection: string,
  transferForm: Object,
  txFee: any,
  wallet: Object,
  actionsPending: Object,
  error: any,
}

const INSUFFICIENT_FUNDS_FOR_TX_FEES = 'Insufficient funds for paying transaction fees'

class RecipientContainer extends Component<Props> {
  componentDidMount () {
    let { profile, transferForm, updateTransferForm } = this.props
    this.props.clearSecurityAnswer()
    if (profile.isAuthenticated) {
      // prefill sender's email address for authenticated user
      updateTransferForm(update(transferForm, { sender: { $set: profile.profileObj.email } }))
    }
  }

  componentDidUpdate (prevProps) {
    const { wallet, walletSelection, cryptoSelection, transferForm, actionsPending } = this.props
    if (prevProps.transferForm.transferAmount !== this.props.transferForm.transferAmount) {
      this.props.getTxFee({
        fromWallet: WalletUtils.toWalletDataFromState(walletSelection, cryptoSelection, wallet),
        transferAmount: transferForm.transferAmount,
        options: {
          prepayTxFee: true
        }
      })
    } else if (!actionsPending.getTxFee && prevProps.actionsPending.getTxFee) {
      this.props.updateTransferForm(
        update(transferForm, {
          formError: {
            transferAmount: { $set: this.validate('transferAmount', transferForm.transferAmount) }
          }
        })
      )
    }
  }

  validateForm = () => {
    const { transferForm } = this.props
    const { formError } = transferForm

    // form must be filled without errors
    return (
      transferForm.sender &&
      transferForm.destination &&
      transferForm.transferAmount &&
      transferForm.password &&
      !formError.sender &&
      !formError.destination &&
      !formError.transferAmount &&
      !formError.password &&
      !formError.message
    )
  }

  validate = (name, value) => {
    const { wallet, cryptoSelection, txFee } = this.props
    let balance = wallet ? wallet.crypto[cryptoSelection][0].balance : null
    const decimals = getCryptoDecimals(cryptoSelection)
    if (name === 'transferAmount') {
      if (
        !validator.isFloat(value, { min: 0.001, max: utils.toHumanReadableUnit(balance, decimals) })
      ) {
        if (value === '-' || parseFloat(value) < 0.001) {
          return 'The amount must be greater than 0.001'
        } else {
          return `Exceed your balance of ${utils.toHumanReadableUnit(balance, decimals)}`
        }
      } else if (txFee) {
        // balance check passed
        if (['ethereum', 'dai'].includes(cryptoSelection)) {
          // ethereum based coins
          // now check if ETH balance is sufficient for paying tx fees
          if (
            cryptoSelection === 'ethereum' &&
            new BN(balance).lt(
              new BN(txFee.costInBasicUnit).add(
                utils.toBasicTokenUnit(parseFloat(value), decimals, 8)
              )
            )
          ) {
            return INSUFFICIENT_FUNDS_FOR_TX_FEES
          }
          if (cryptoSelection === 'dai') {
            let ethBalance = wallet.crypto.dai[0].ethBalance
            if (new BN(ethBalance).lt(new BN(txFee.costInBasicUnit))) {
              return INSUFFICIENT_FUNDS_FOR_TX_FEES
            }
          }
        } else if (
          cryptoSelection === 'bitcoin' &&
          new BN(balance).lt(
            new BN(txFee.costInBasicUnit).add(
              utils.toBasicTokenUnit(parseFloat(value), decimals, 8)
            )
          )
        ) {
          return INSUFFICIENT_FUNDS_FOR_TX_FEES
        }
      }
    } else if (name === 'sender' || name === 'destination') {
      if (!validator.isEmail(value)) {
        return 'Invalid email'
      }
    } else if (name === 'password') {
      if (!validator.isLength(value, { min: 6, max: undefined })) {
        return 'Length must be greater or equal than 6'
      }
    }
    return null
  }

  handleTransferFormChange = name => event => {
    const { transferForm, cryptoPrice, cryptoSelection } = this.props

    // helper functions for converting currency
    const toCurrencyAmount = cryptoAmount =>
      utils.toCurrencyAmount(cryptoAmount, cryptoPrice[cryptoSelection])
    const toCryptoAmount = currencyAmount =>
      utils.toCryptoAmount(currencyAmount, cryptoPrice[cryptoSelection])

    let _transferForm = update(transferForm, {
      [name]: { $set: event.target.value },
      formError: { [name]: { $set: this.validate(name, event.target.value) } }
    })

    if (name === 'message') {
      // removes whitespaces at the beginning
      _transferForm[name] = _transferForm[name].replace(/^\s+/g, '')
    }

    if (name === 'transferAmount') {
      // sync transferCurrencyAmount
      const transferAmountVal = event.target.value === '' ? 0.0 : parseFloat(event.target.value)
      const transferCurrencyAmountVal = toCurrencyAmount(transferAmountVal)

      _transferForm = update(_transferForm, {
        transferCurrencyAmount: { $set: transferCurrencyAmountVal.toString() },
        formError: { 'transferCurrencyAmount': { $set: this.validate('transferCurrencyAmount', transferCurrencyAmountVal.toString()) } }
      })
    }

    if (name === 'transferCurrencyAmount') {
      // sync transferAmount
      const transferCurrencyAmountVal = event.target.value === '' ? 0.0 : parseFloat(event.target.value)
      const transferAmountVal = toCryptoAmount(transferCurrencyAmountVal)
      _transferForm = update(_transferForm, {
        transferAmount: { $set: transferAmountVal.toString() },
        formError: { 'transferAmount': { $set: this.validate('transferAmount', transferAmountVal.toString()) } }
      })
    }

    this.props.updateTransferForm(_transferForm)
  }

  render () {
    const { wallet, cryptoPrice, cryptoSelection, currency } = this.props
    const balance = wallet.crypto[cryptoSelection][0].balance || '0'
    const balanceAmount = utils.toHumanReadableUnit(balance, getCryptoDecimals(cryptoSelection))
    const balanceCurrencyAmount = utils.toCurrencyAmount(balanceAmount, cryptoPrice[cryptoSelection], currency)
    return (
      <Recipient
        {...this.props}
        handleTransferFormChange={this.handleTransferFormChange}
        validate={this.validate}
        validateForm={this.validateForm}
        balanceAmount={balanceAmount}
        balanceCurrencyAmount={balanceCurrencyAmount}
      />
    )
  }
}
const gettxFeeSelector = createLoadingSelector(['GET_TX_COST'])
const errorSelector = createErrorSelector(['GET_TX_COST'])

const mapDispatchToProps = dispatch => {
  return {
    updateTransferForm: (form) => dispatch(updateTransferForm(form)),
    generateSecurityAnswer: () => dispatch(generateSecurityAnswer()),
    clearSecurityAnswer: () => dispatch(clearSecurityAnswer()),
    goToStep: (n) => dispatch(goToStep('send', n)),
    getTxFee: (txRequest) => dispatch(getTxFee(txRequest))
  }
}

const mapStateToProps = state => {
  return {
    cryptoSelection: state.formReducer.cryptoSelection,
    walletSelection: state.formReducer.walletSelection,
    transferForm: state.formReducer.transferForm,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    profile: state.userReducer.profile,
    txFee: state.transferReducer.txFee,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    actionsPending: {
      getTxFee: gettxFeeSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecipientContainer)
