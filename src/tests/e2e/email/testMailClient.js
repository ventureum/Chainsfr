// @flow
import { GraphQLClient } from '@testmail.app/graphql-request'

const DEFAULT_TAG = 'receiver'

type ParsedAddress = {
  address: string,
  name: string
}

type EmailType = {
  from: string,
  from_parsed: ParsedAddress,
  subject: string,
  html: string
}

if (!process.env.E2E_TEST_TEST_MAIL_API_KEY) throw new Error('E2E_TEST_TEST_MAIL_API_KEY missing')
const testMailApiKey = process.env.E2E_TEST_TEST_MAIL_API_KEY
if (!process.env.REACT_APP_E2E_TEST_TEST_MAIL_NAMESPACE)
  throw new Error('REACT_APP_E2E_TEST_TEST_MAIL_NAMESPACE missing')
const testMailNamespace = process.env.REACT_APP_E2E_TEST_TEST_MAIL_NAMESPACE
const suffix = (process.env.REACT_APP_E2E_TEST_MAIL_TAG_SUFFIX || '').toLowerCase()

export default class TestMailsClient {
  tag: string
  testmailClient: GraphQLClient

  constructor (tag: string = 'receiver') {
    this.tag = tag
    this.testmailClient = new GraphQLClient(
      // API endpoint:
      'https://api.testmail.app/api/graphql',
      // Use your API key:
      { headers: { Authorization: `Bearer ${testMailApiKey}` } }
    )
  }

  // subjectFilterValue is an optional param which is used to filter
  // emails with their subject
  async liveEmailQuery (subjectFilterValue?: string): Promise<EmailType> {
    const timestamp = Date.now()
    let data
    if (subjectFilterValue) {
      data = await this.testmailClient.request(`{
        inbox (
          namespace:"${testMailNamespace}"
          tag:"${this.tag}${suffix}"
          timestamp_from:${timestamp}
          livequery:true
          advanced_filters:[{
            field:subject
            match:exact
            action:include
            value:"${subjectFilterValue}"
          }]
        ) {
          result
          message
          count
          emails {
            from
            from_parsed {
              address
              name
            }
            subject
            html
          }
        }
      }`)
    } else {
      data = await this.testmailClient.request(`{
        inbox (
          namespace:"${testMailNamespace}"
          tag:"${this.tag}"
          timestamp_from:${timestamp}
          livequery:true
        ) {
          result
          message
          count
          emails {
            from
            from_parsed {
              address
              name
            }
            subject
            html
          }
        }
      }`)
    }
    const { inbox } = data
    if (inbox.result !== 'success' || inbox.count < 1) {
      throw new Error(`Live email query for tag ${this.tag} failed`)
    } else {
      // returns the latest email
      return inbox.emails[0]
    }
  }

  async fetchAllEmails (): Promise<Array<EmailType>> {
    const data = await this.testmailClient.request(`{
    inbox (
      namespace:"${testMailNamespace}"
      tag:"${this.tag}"
    ) {
      result
      message
      count
      emails {
        from
        from_parsed {
          address
          name
        }
        subject
        html
      }
    }
  }`)
    const { inbox } = data
    if (inbox.result !== 'success') {
      throw new Error(`fetch all emails failed`)
    } else {
      return inbox.emails
    }
  }
}
