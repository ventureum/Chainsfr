import React, { Component } from 'react'
import { connect } from 'react-redux'
import TransferForm from '../components/TransferFormComponent'
import {
  updateTransferForm,
  generateSecurityAnswer,
  clearSecurityAnswer
} from '../actions/formActions'
import { goToStep } from '../actions/navigationActions'
import update from 'immutability-helper'
import validator from 'validator'
import BN from 'bn.js'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { getTxFee } from '../actions/transferActions.js'
import { getRecipients, addRecipient } from '../actions/userActions'
import utils from '../utils'
import { getCryptoDecimals } from '../tokens'
import { AddRecipientDialog } from '../components/RecipientActionComponents'

type Props = {
  updateTransferForm: Function,
  generateSecurityAnswer: Function,
  clearSecurityAnswer: Function,
  goToStep: Function,
  transferForm: Object,
  txFee: any,
  wallet: Object,
  actionsPending: Object,
  error: any
}

type State = {
  openAddRecipientDialog: boolean
}
const INSUFFICIENT_FUNDS_FOR_TX_FEES = 'Insufficient funds for paying transaction fees'

class TransferFormContainer extends Component<Props, State> {
  state = { openAddRecipientDialog: false }

  componentDidMount () {
    let {
      profile,
      transferForm,
      updateTransferForm,
      getRecipients,
      destinationPrefilled,
      receiverNamePrefilled
    } = this.props
    this.props.clearSecurityAnswer()
    if (profile.isAuthenticated) {
      // prefill form
      updateTransferForm(
        update(transferForm, {
          sender: { $set: profile.profileObj.email },
          senderName: { $set: profile.profileObj.name },
          destination: { $set: destinationPrefilled },
          receiverName: { $set: receiverNamePrefilled }
        })
      )
      getRecipients()
    }
  }

  toggleAddRecipientDialog = action => {
    this.setState({
      openAddRecipientDialog: !this.state.openAddRecipientDialog
    })
  }

  componentDidUpdate (prevProps) {
    const { transferForm, actionsPending } = this.props
    if (prevProps.transferForm.transferAmount !== this.props.transferForm.transferAmount) {
      // if transfer amount changed, update tx fee
      const { accountSelection } = transferForm
      this.props.getTxFee({
        fromAccount: accountSelection,
        transferAmount: transferForm.transferAmount
      })
    } else if (!actionsPending.getTxFee && prevProps.actionsPending.getTxFee) {
      // if tx fee updated, re-validate form
      this.props.updateTransferForm(
        update(transferForm, {
          formError: {
            transferAmount: {
              $set: this.validate('transferAmount', transferForm.transferAmount, transferForm)
            }
          }
        })
      )
    }
    if (
      prevProps.actionsPending.addRecipient &&
      !this.props.actionsPending.addRecipient &&
      !this.props.error
    ) {
      // if add recipient successfully, close dialog
      this.toggleAddRecipientDialog()
    }
  }

  validateForm = () => {
    const { transferForm } = this.props
    const { formError } = transferForm

    // form must be filled without errors
    return (
      transferForm.senderName &&
      transferForm.sender &&
      transferForm.destination &&
      transferForm.transferAmount &&
      transferForm.password &&
      !formError.senderName &&
      !formError.sender &&
      !formError.destination &&
      !formError.transferAmount &&
      !formError.password &&
      !formError.sendMessage
    )
  }

  crossCheck = (stringA, stringB) => {
    let _stringA = stringA.split(' ')
    let _stringB = stringB.split(' ')
    // check if there is a word in stringA appears in stringB
    return _stringA.reduce((accumulator, currentValue) => {
      return accumulator || (_stringB.includes(currentValue) && currentValue !== '')
    }, false)
  }

  validate = (name, value, transferForm) => {
    const { txFee } = this.props

    if (name === 'transferAmount') {
      const { accountSelection } = transferForm
      const { cryptoType, balance } = accountSelection
      const decimals = getCryptoDecimals(cryptoType)
      if (
        !validator.isFloat(value, {
          min: 0.001,
          max: parseFloat(accountSelection.balanceInStandardUnit)
        })
      ) {
        if (parseFloat(value) < 0.001) {
          return 'The amount must be greater than 0.001'
        } else if (parseFloat(value) > parseFloat(accountSelection.balanceInStandardUnit)) {
          return `Exceed your balance of ${accountSelection.balanceInStandardUnit}`
        } else {
          return 'Please enter a valid amount'
        }
      }
      if (txFee) {
        // balance check passed
        if (['ethereum', 'dai'].includes(cryptoType)) {
          // ethereum based coins
          // now check if ETH balance is sufficient for paying tx fees
          if (
            cryptoType === 'ethereum' &&
            new BN(balance).lt(
              new BN(txFee.costInBasicUnit).add(
                utils.toBasicTokenUnit(parseFloat(value), decimals, 8)
              )
            )
          ) {
            return INSUFFICIENT_FUNDS_FOR_TX_FEES
          }
          if (cryptoType === 'dai') {
            let ethBalance = accountSelection.ethBalance
            if (new BN(ethBalance).lt(new BN(txFee.costInBasicUnit))) {
              return INSUFFICIENT_FUNDS_FOR_TX_FEES
            }
          }
        } else if (
          cryptoType === 'bitcoin' &&
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
      if (this.crossCheck(value, transferForm['sendMessage'])) {
        return 'Security answer cannot contain words from the message'
      }
    } else if (name === 'senderName') {
      if (!validator.isLength(value, { min: 1, max: undefined })) {
        return 'Name is required'
      }
    } else if (name === 'sendMessage') {
      if (this.crossCheck(value, transferForm['password'])) {
        return 'Message cannot contain words from the security answer'
      }
    }
    return null
  }

  handleTransferFormChange = name => event => {
    const { transferForm, cryptoPrice, recipients } = this.props

    // helper functions for converting currency
    const { accountSelection } = transferForm
    const toCurrencyAmount = cryptoAmount =>
      utils.toCurrencyAmount(cryptoAmount, cryptoPrice[accountSelection.cryptoType])
    const toCryptoAmount = currencyAmount =>
      utils.toCryptoAmount(currencyAmount, cryptoPrice[accountSelection.cryptoType])
    let _transferForm = transferForm

    if (
      !(name === 'destination' && event.target.value === 'AddRecipient') &&
      !(name === 'accountSelection' && event.target.value === 'addCryptoAccount')
    ) {
      _transferForm = update(transferForm, {
        [name]: { $set: event.target.value },
        formError: { [name]: { $set: this.validate(name, event.target.value, transferForm) } }
      })
    }

    if (name === 'sendMessage') {
      // removes whitespaces at the beginning
      _transferForm[name] = _transferForm[name].replace(/^\s+/g, '')

      const password = _transferForm['password']
      _transferForm = update(_transferForm, {
        formError: {
          password: { $set: this.validate('password', password, _transferForm) }
        }
      })
    }

    if (name === 'transferAmount') {
      // sync transferCurrencyAmount
      const transferAmountVal = event.target.value === '' ? 0.0 : parseFloat(event.target.value)
      const transferCurrencyAmountVal = toCurrencyAmount(transferAmountVal)

      _transferForm = update(_transferForm, {
        transferCurrencyAmount: { $set: transferCurrencyAmountVal.toString() },
        formError: {
          transferCurrencyAmount: {
            $set: this.validate(
              'transferCurrencyAmount',
              transferCurrencyAmountVal.toString(),
              _transferForm
            )
          }
        }
      })
    }

    if (name === 'transferCurrencyAmount') {
      // sync transferAmount
      const transferCurrencyAmountVal =
        event.target.value === '' ? 0.0 : parseFloat(event.target.value)
      const transferAmountVal = toCryptoAmount(transferCurrencyAmountVal)
      _transferForm = update(_transferForm, {
        transferAmount: { $set: transferAmountVal.toString() },
        formError: {
          transferAmount: {
            $set: this.validate('transferAmount', transferAmountVal.toString(), _transferForm)
          }
        }
      })
    }

    if (name === 'password') {
      const sendMessage = _transferForm['sendMessage']
      _transferForm = update(_transferForm, {
        formError: {
          sendMessage: { $set: this.validate('sendMessage', sendMessage, _transferForm) }
        }
      })
    }

    if (name === 'destination' && event.target.value !== 'AddRecipient') {
      // update receiverName
      const recipient = recipients.find(recipient => recipient.email === event.target.value)
      if (recipient) {
        _transferForm = update(_transferForm, { receiverName: { $set: recipient.name } })
      }
    }

    this.props.updateTransferForm(_transferForm)
  }

  render () {
    const {
      cryptoPrice,
      currency,
      actionsPending,
      addRecipient,
      transferForm
    } = this.props
    const { accountSelection } = transferForm
    let balanceCurrencyAmount = '0'
    if (accountSelection) {
      balanceCurrencyAmount = utils.toCurrencyAmount(
        accountSelection.balanceInStandardUnit,
        cryptoPrice[accountSelection.cryptoType],
        currency
      )
    }

    return (
      <>
        <TransferForm
          {...this.props}
          handleTransferFormChange={this.handleTransferFormChange}
          validate={this.validate}
          validateForm={this.validateForm}
          balanceCurrencyAmount={balanceCurrencyAmount}
          addRecipient={() => this.toggleAddRecipientDialog()}
        />
        {this.state.openAddRecipientDialog && (
          <AddRecipientDialog
            open={this.state.openAddRecipientDialog}
            handleClose={() => this.toggleAddRecipientDialog()}
            handleSubmit={addRecipient}
            loading={actionsPending.addRecipient}
          />
        )}
      </>
    )
  }
}
const gettxFeeSelector = createLoadingSelector(['GET_TX_COST'])
const errorSelector = createErrorSelector(['GET_TX_COST', 'ADD_RECIPIENT'])
const getRecipientsSelector = createLoadingSelector(['GET_RECIPIENTS'])
const addRecipientSelector = createLoadingSelector(['ADD_RECIPIENT'])

const mapDispatchToProps = dispatch => {
  return {
    updateTransferForm: form => dispatch(updateTransferForm(form)),
    generateSecurityAnswer: () => dispatch(generateSecurityAnswer()),
    clearSecurityAnswer: () => dispatch(clearSecurityAnswer()),
    goToStep: n => dispatch(goToStep('send', n)),
    getTxFee: txRequest => dispatch(getTxFee(txRequest)),
    getRecipients: () => dispatch(getRecipients()),
    addRecipient: recipient => dispatch(addRecipient(recipient)),
  }
}

const mapStateToProps = state => {
  return {
    transferForm: state.formReducer.transferForm,
    profile: state.userReducer.profile,
    txFee: state.transferReducer.txFee,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    recipients: state.userReducer.recipients,
    actionsPending: {
      getTxFee: gettxFeeSelector(state),
      getRecipients: getRecipientsSelector(state),
      addRecipient: addRecipientSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransferFormContainer)
