import React, { Component } from 'react'
import { connect } from 'react-redux'
import EmailTransferForm from '../components/EmailTransferFormComponent'
import DirectTransferForm from '../components/DirectTransferFormComponent'
import { updateTransferForm, clearSecurityAnswer } from '../actions/formActions'
import { goToStep, backToHome } from '../actions/navigationActions'
import update from 'immutability-helper'
import validator from 'validator'
import BN from 'bn.js'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { getTxFee } from '../actions/transferActions.js'
import { getRecipients, addRecipient } from '../actions/userActions'
import utils from '../utils'
import { getCryptoDecimals } from '../tokens'
import { AddRecipientDialog } from '../components/RecipientActionComponents'
import { push } from 'connected-react-router'

type Props = {
  updateTransferForm: Function,
  clearSecurityAnswer: Function,
  goToStep: Function,
  transferForm: Object,
  accountSelection: Object,
  txFee: any,
  wallet: Object,
  actionsPending: Object,
  error: any
}

type State = {
  openAddRecipientDialog: boolean
}
const INSUFFICIENT_FUNDS_FOR_TX_FEES = 'Insufficient funds for paying transaction fees'

class FormContainer extends Component<Props, State> {
  state = { openAddRecipientDialog: false }

  componentDidMount () {
    let {
      profile,
      transferForm,
      updateTransferForm,
      getRecipients,
      destinationPrefilled,
      receiverNamePrefilled,
      walletSelectionPrefilled,
      cryptoTypePrefilled,
      addressPrefilled
    } = this.props
    if (profile.isAuthenticated) {
      // prefill form
      updateTransferForm(
        update(transferForm, {
          sender: { $set: profile.profileObj.email },
          senderName: { $set: profile.profileObj.name },
          destination: { $set: destinationPrefilled || transferForm.destination },
          receiverName: { $set: receiverNamePrefilled || transferForm.receiverName },
          accountId: {
            $set: {
              walletType: walletSelectionPrefilled || transferForm.accountId.walletType,
              cryptoType: cryptoTypePrefilled || transferForm.accountId.cryptoType,
              address: addressPrefilled || transferForm.accountId.address
            }
          }
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
    const { transferForm, actionsPending, accountSelection } = this.props
    if (prevProps.transferForm.transferAmount !== this.props.transferForm.transferAmount) {
      // if transfer amount changed, update tx fee
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

  validateForm = transferForm => {
    const { formError } = transferForm

    // form must be filled without errors
    return (
      !!transferForm.accountId.cryptoType &&
      !!transferForm.accountId.walletType &&
      (!!transferForm.accountId.address || !!transferForm.accountId.xpub) &&
      !!transferForm.senderName &&
      !!transferForm.sender &&
      !!transferForm.destination &&
      !!transferForm.receiverName &&
      !!transferForm.transferAmount &&
      !!transferForm.password &&
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
    const { txFee, accountSelection } = this.props

    if (name === 'transferAmount') {
      const { cryptoType, balance } = accountSelection
      const decimals = getCryptoDecimals(cryptoType)
      if (
        !validator.isFloat(value, {
          min: 0.001,
          max: parseFloat(accountSelection.balanceInStandardUnit)
        })
      ) {
        if (!parseFloat(value)) {
          return null
        }
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
      // typeof valud === 'object' for direact transfer
      if (typeof value === 'string' && !validator.isEmail(value)) {
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
    const {
      transferForm,
      cryptoPrice,
      recipients,
      accountSelection,
      form,
      cryptoAccounts
    } = this.props

    // helper functions for converting currency
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
      if (form === 'direct_transfer') {
        _transferForm = update(_transferForm, {
          accountId: {
            $set: cryptoAccounts.find(
              _account =>
                _account.walletType === 'drive' &&
                _account.cryptoType === event.target.value.cryptoType
            )
          },
          destination: { $set: event.target.value },
          transferAmount: { $set: '' },
          transferCurrencyAmount: { $set: '' }
        })
      } else {
        const recipient = recipients.find(recipient => recipient.email === event.target.value)
        if (recipient) {
          _transferForm = update(_transferForm, { receiverName: { $set: recipient.name } })
        }
      }
    }

    _transferForm.validated = this.validateForm(_transferForm)
    this.props.updateTransferForm(_transferForm)
  }

  generateSecurityAnswer = () => {
    return utils.generatePassphrase(6).join(' ')
  }

  render () {
    const {
      cryptoPrice,
      currency,
      actionsPending,
      addRecipient,
      walletSelectionPrefilled,
      cryptoTypePrefilled,
      addressPrefilled,
      accountSelection,
      form,
      transferForm,
      error
    } = this.props
    let balanceCurrencyAmount = '0'

    if (accountSelection) {
      balanceCurrencyAmount = utils.toCurrencyAmount(
        accountSelection.balanceInStandardUnit,
        cryptoPrice[accountSelection.cryptoType],
        currency
      )
    }

    if (form === 'direct_transfer') {
      return (
        <DirectTransferForm
          currency={currency}
          handleTransferFormChange={this.handleTransferFormChange}
          accountSelection={accountSelection}
          balanceCurrencyAmount={balanceCurrencyAmount}
          transferForm={transferForm}
          error={error}
        />
      )
    }
    return (
      <>
        <EmailTransferForm
          {...this.props}
          handleTransferFormChange={this.handleTransferFormChange}
          validate={this.validate}
          validateForm={this.validateForm}
          balanceCurrencyAmount={balanceCurrencyAmount}
          addRecipient={() => this.toggleAddRecipientDialog()}
          prefilledAccount={{
            walletType: walletSelectionPrefilled,
            crytoType: cryptoTypePrefilled,
            address: addressPrefilled
          }}
          generateSecurityAnswer={this.generateSecurityAnswer}
          error={error}
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
    clearSecurityAnswer: () => dispatch(clearSecurityAnswer()),
    goToStep: n => dispatch(goToStep('send', n)),
    getTxFee: txRequest => dispatch(getTxFee(txRequest)),
    getRecipients: () => dispatch(getRecipients()),
    addRecipient: recipient => dispatch(addRecipient(recipient)),
    backToHome: () => dispatch(backToHome()),
    push: path => dispatch(push(path))
  }
}

const mapStateToProps = state => {
  return {
    transferForm: state.formReducer.transferForm,
    accountSelection: state.accountReducer.cryptoAccounts.find(_account =>
      utils.accountsEqual(_account, state.formReducer.transferForm.accountId)
    ),
    cryptoAccounts: state.accountReducer.cryptoAccounts,
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

export default connect(mapStateToProps, mapDispatchToProps)(FormContainer)
