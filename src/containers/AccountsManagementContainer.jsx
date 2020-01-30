import React, { Component } from 'react'
import { connect } from 'react-redux'
import AccountsManagementComponent from '../components/AccountsManagementComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import {
  addCryptoAccounts,
  removeCryptoAccounts,
  modifyCryptoAccountsName
} from '../actions/accountActions'
import { accountStatus, CategorizedAccount } from '../types/account.flow.js'
import { push } from 'connected-react-router'
import path from '../Paths.js'
import utils from '../utils'
import { getCryptoPlatformType } from '../tokens'

class AccountsManagementContainer extends Component {
  handleTransferFrom = (account: CategorizedAccount) => {
    const { push } = this.props

    const accountData = account.assets[0]
    if (account.platformType === 'bitcoin' && accountData.hdWalletVariables.xpub) {
      push(
        `${path.transfer}` +
          `?walletSelection=${account.walletType}` +
          `&xpub=${accountData.hdWalletVariables.xpub}&platformType=${account.platformType}`
      )
    } else {
      push(
        `${path.transfer}` +
          `?walletSelection=${account.walletType}` +
          `&address=${accountData.address}&platformType=${account.platformType}`
      )
    }
  }

  getCategorizedAccounts = (cryptoAccounts): Array<CategorizedAccount> => {
    const { cryptoPrice, currency } = this.props

    let categorizedAccounts = []
    cryptoAccounts.forEach(accountData => {
      const marketValue = utils.toCurrencyAmount(
        accountData.balanceInStandardUnit,
        cryptoPrice[accountData.cryptoType]
      )
      let existIndex = -1
      if (getCryptoPlatformType(accountData.cryptoType) === 'ethereum') {
        // Add account to categorizedAccounts by categorizedAccount id
        existIndex = categorizedAccounts.findIndex(
          account =>
            account.address === accountData.address && account.walletType === accountData.walletType
        )
      }
      if (existIndex >= 0) {
        categorizedAccounts[existIndex].totalMarketValue =
          parseFloat(categorizedAccounts[existIndex].totalMarketValue) + parseFloat(marketValue)
        categorizedAccounts[existIndex].assets.push({ ...accountData, marketValue: marketValue })
        categorizedAccounts[existIndex].status =
          accountData.status === accountStatus.synced &&
          categorizedAccounts[existIndex].status === accountStatus.synced
            ? accountStatus.synced
            : accountData.status
      } else {
        // the corresponding categorizedAccount id not found, push a new categorizedAccount
        categorizedAccounts.push({
          totalMarketValue: marketValue,
          fiatCurrency: currency,
          assets: [{ ...accountData, marketValue: marketValue }],
          platformType: getCryptoPlatformType(accountData.cryptoType),
          walletType: accountData.walletType,
          address: accountData.address,
          status: accountData.status,
          name: accountData.name,
          id: JSON.stringify({ address: accountData.address, walletType: accountData.walletType })
        })
      }
    })
    return categorizedAccounts
  }

  modifyCryptoAccountsName = (account, newName) => {
    this.props.modifyCryptoAccountsName(account.assets, newName)
  }

  removeCryptoAccounts = account => {
    this.props.removeCryptoAccounts(account.assets)
  }

  render () {
    const { addCryptoAccounts, actionsPending, cryptoAccounts, currency, online } = this.props
    const categorizedAccounts = this.getCategorizedAccounts(cryptoAccounts)
    return (
      <AccountsManagementComponent
        categorizedAccounts={categorizedAccounts}
        addCryptoAccounts={addCryptoAccounts}
        actionsPending={actionsPending}
        modifyCryptoAccountsName={this.modifyCryptoAccountsName}
        removeCryptoAccounts={this.removeCryptoAccounts}
        handleTransferFrom={this.handleTransferFrom}
        online={online}
        currency={currency}
      />
    )
  }
}

const addCryptoAccountsSelector = createLoadingSelector(['ADD_CRYPTO_ACCOUNTS'])
const removeCryptoAccountsSelector = createLoadingSelector(['REMOVE_CRYPTO_ACCOUNTS'])
const getCryptoAccountsSelector = createLoadingSelector(['GET_CRYPTO_ACCOUNTS'])

const errorSelector = createErrorSelector(['ADD_CRYPTO_ACCOUNTS', 'REMOVE_CRYPTO_ACCOUNTS'])

const mapStateToProps = state => {
  return {
    cryptoAccounts: state.accountReducer.cryptoAccounts.filter(item => {
      return item.walletType !== 'drive'
    }),
    actionsPending: {
      addCryptoAccounts: addCryptoAccountsSelector(state),
      removeCryptoAccounts: removeCryptoAccountsSelector(state),
      getCryptoAccounts: getCryptoAccountsSelector(state)
    },
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addCryptoAccounts: accountData => dispatch(addCryptoAccounts(accountData)),
    removeCryptoAccounts: accountData => dispatch(removeCryptoAccounts(accountData)),
    modifyCryptoAccountsName: (accountData, newName) =>
      dispatch(modifyCryptoAccountsName(accountData, newName)),
    push: path => dispatch(push(path))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountsManagementContainer)
