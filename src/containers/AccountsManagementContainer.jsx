import React, { Component } from 'react'
import { connect } from 'react-redux'
import AddTokenDrawer from '../components/AddNewTokenComponent'
import AccountsManagementComponent from '../components/AccountsManagementComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import {
  addCryptoAccounts,
  removeCryptoAccounts,
  modifyCryptoAccountsName,
  getAllEthContracts
} from '../actions/accountActions'
import { accountStatus, CategorizedAccount } from '../types/account.flow.js'
import { createAccount } from '../accounts/AccountFactory'
import { push } from 'connected-react-router'
import path from '../Paths.js'
import utils from '../utils'
import { getCryptoPlatformType } from '../tokens'

class AccountsManagementContainer extends Component {
  state = {
    addTokenDrawer: false
  }

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
            account.address === accountData.address &&
            account.walletType === accountData.walletType
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

  // Get the list of wallet user currently has
  // To be used by 'add new token'.
  getWallets = cryptoAccounts => {
    let wallets = []
    cryptoAccounts.forEach(accountData => {
      const index = wallets.findIndex(wallet => {
        return (
          wallet.walletType === accountData.walletType && wallet.address === accountData.address
        )
      })
      if (index < 0) {
        wallets.push({
          walletType: accountData.walletType,
          address: accountData.address,
          platformType: accountData.platformType,
          name: accountData.name
        })
      }
    })
    return wallets
  }

  modifyCryptoAccountsName = (account, newName) => {
    this.props.modifyCryptoAccountsName(account.assets, newName)
  }

  removeCryptoAccounts = account => {
    this.props.removeCryptoAccounts(account.assets)
  }

  toggleAddTokenDrawer = () => {
    this.setState(state => {
      return {
        addTokenDrawer: !state.addTokenDrawer
      }
    })
  }

  addToken = (wallet, token) => {
    const newAccount = createAccount({
      walletType: wallet.walletType,
      name: wallet.name,
      cryptoType: token.cryptoType,
      platformType: 'ethereum',
      address: wallet.address
    })

    this.props.addCryptoAccounts([newAccount.getAccountData()], true)
  }

  render () {
    const { addTokenDrawer } = this.state
    const {
      addCryptoAccounts,
      actionsPending,
      cryptoAccounts,
      currency,
      online,
      ethContracts
    } = this.props
    const categorizedAccounts = this.getCategorizedAccounts(
      cryptoAccounts.filter(accountData => accountData.walletType !== 'drive')
    )

    const wallets = this.getWallets(
      cryptoAccounts.filter(accountData => accountData.cryptoType !== 'bitcoin')
    )

    return (
      <>
        <AccountsManagementComponent
          categorizedAccounts={categorizedAccounts}
          addCryptoAccounts={addCryptoAccounts}
          actionsPending={actionsPending}
          modifyCryptoAccountsName={this.modifyCryptoAccountsName}
          removeCryptoAccounts={this.removeCryptoAccounts}
          handleTransferFrom={this.handleTransferFrom}
          onAddToken={this.toggleAddTokenDrawer}
          online={online}
          currency={currency}
        />
        {addTokenDrawer && (
          <AddTokenDrawer
            wallets={wallets}
            onClose={this.toggleAddTokenDrawer}
            ethContracts={ethContracts}
            addToken={this.addToken}
            adding={actionsPending.addCryptoAccounts}
          />
        )}
      </>
    )
  }
}

const addCryptoAccountsSelector = createLoadingSelector(['ADD_CRYPTO_ACCOUNTS'])
const removeCryptoAccountsSelector = createLoadingSelector(['REMOVE_CRYPTO_ACCOUNTS'])
const getCryptoAccountsSelector = createLoadingSelector(['GET_CRYPTO_ACCOUNTS'])

const errorSelector = createErrorSelector(['ADD_CRYPTO_ACCOUNTS', 'REMOVE_CRYPTO_ACCOUNTS'])

const mapStateToProps = state => {
  return {
    cryptoAccounts: state.accountReducer.cryptoAccounts,
    actionsPending: {
      addCryptoAccounts: addCryptoAccountsSelector(state),
      removeCryptoAccounts: removeCryptoAccountsSelector(state),
      getCryptoAccounts: getCryptoAccountsSelector(state)
    },
    ethContracts: state.accountReducer.ethContracts,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getAllEthContracts: () => dispatch(getAllEthContracts()),
    addCryptoAccounts: (accountData, addToken) =>
      dispatch(addCryptoAccounts(accountData, addToken)),
    removeCryptoAccounts: accountData => dispatch(removeCryptoAccounts(accountData)),
    modifyCryptoAccountsName: (accountData, newName) =>
      dispatch(modifyCryptoAccountsName(accountData, newName)),
    push: path => dispatch(push(path))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountsManagementContainer)
