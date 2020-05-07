import cheerio from 'cheerio'
import TestMailClient from './testMailClient'
import { getCryptoSymbol } from '../../../tokens'

const SELECTORS = {
  SENDER: {
    SEND: {
      MESSAGE:
        '#templateBody > table:nth-child(2) > tbody > tr > td > table > tbody > tr > td > div > span > span',
      CANCEL_BTN:
        '#templateBody > table:nth-child(4) > tbody > tr > td > table > tbody > tr > td > div > span > span > ol > li:nth-child(3) > span > span > a'
    },
    RECEIVE: {
      MESSAGE:
        '#templateBody > table:nth-child(2) > tbody > tr > td > table > tbody > tr > td > div > span > span',
      RECEIPT_BTN:
        '#templateBody > table:nth-child(4) > tbody > tr > td > table > tbody > tr > td > div > span > span > a'
    },
    CANCEL: {
      MESSAGE:
        '#templateBody > table:nth-child(2) > tbody > tr > td > table > tbody > tr > td > div > span > span',
      RECEIPT_BTN:
        '#templateBody > table:nth-child(4) > tbody > tr > td > table > tbody > tr > td > div > span > span > a'
    }
  },
  RECEIVER: {
    SEND: {
      MESSAGE:
        '#templateBody > table:nth-child(2) > tbody > tr > td > table > tbody > tr > td > div > span > span',
      DEPOSIT_BTN:
        '#templateBody > table:nth-child(3) > tbody > tr > td > table > tbody > tr > td > a',
      DEPOSIT_REMINDER:
        '#templateBody > table:nth-child(5) > tbody > tr > td > table > tbody > tr > td > div > span > span'
    },
    RECEIVE: {
      MESSAGE:
        '#templateBody > table:nth-child(2) > tbody > tr > td > table > tbody > tr > td > div > span > span',
      RECEIPT_BTN:
        '#templateBody > table:nth-child(4) > tbody > tr > td > table > tbody > tr > td > div > span > span > a'
    },
    CANCEL: {
      MESSAGE:
        '#templateBody > table:nth-child(2) > tbody > tr > td > table > tbody > tr > td > div > span > span',
      RECEIPT_BTN:
        '#templateBody > table:nth-child(4) > tbody > tr > td > table > tbody > tr > td > div > span > span > a'
    }
  }
}

const getEmailSubject = (type, stage, transferData) => {
  if (type === 'sender') {
    if (stage === 'send') {
      return `Chainsfr: Your payment of ${transferData.transferAmount} ${getCryptoSymbol(
        transferData.cryptoType
      )} has been sent to ${transferData.receiverName}`
    } else if (stage === 'receive') {
      return `Chainsfr: ${transferData.receiverName} accepted your payment of ${
        transferData.transferAmount
      } ${getCryptoSymbol(transferData.cryptoType)}`
    } else if (stage === 'cancel') {
      return `Chainsfr: The payment of ${transferData.transferAmount} ${getCryptoSymbol(
        transferData.cryptoType
      )} to ${transferData.receiverName} has been cancelled`
    }
  } else if (type === 'receiver') {
    if (stage === 'send') {
      return `Chainsfr: ${transferData.senderName} sent you a payment of ${
        transferData.transferAmount
      } ${getCryptoSymbol(transferData.cryptoType)}`
    } else if (stage === 'receive') {
      return `Chainsfr: The payment of ${transferData.transferAmount} ${getCryptoSymbol(
        transferData.cryptoType
      )} from ${transferData.senderName} has been deposited`
    } else if (stage === 'cancel') {
      return `Chainsfr: The payment of ${transferData.transferAmount} ${getCryptoSymbol(
        transferData.cryptoType
      )} from ${transferData.senderName} has been cancelled`
    }
  }
}

class EmailParser {
  constructor (html: string) {
    this.html = html
    this.$ = cheerio.load(html)
  }

  getEmailElementText (selector) {
    return this.$(selector).text()
  }

  getEmailElementAttribute (selector, attribute) {
    return this.$(selector).attr(attribute)
  }
}

export { EmailParser, SELECTORS, getEmailSubject }
