if (!process.env.REACT_APP_E2E_TEST_TEST_MAIL_NAMESPACE)
  throw new Error('REACT_APP_E2E_TEST_TEST_MAIL_NAMESPACE missing')
const testMailNamespace = process.env.REACT_APP_E2E_TEST_TEST_MAIL_NAMESPACE
const suffix = process.env.REACT_APP_E2E_TEST_MAIL_TAG_SUFFIX || ''

const RECIPIENTS = [
  {
    addedAt: 1577139574,
    email: 'alice@gmail.com',
    name: 'Alice',
    updatedAt: 1577139574,
    validEmail: true,
    validName: true
  },
  {
    addedAt: 1577139584,
    email: 'bob@gmail.com',
    name: 'Bob',
    updatedAt: 1577139584,
    validEmail: true,
    validName: true
  },
  {
    addedAt: 1577141759,
    email: 'timothy@ventureum.io',
    name: 'Tom',
    updatedAt: 1577141759,
    validEmail: true,
    validName: true
  },
  {
    addedAt: 1584499597,
    email: 'chainsfre2etest@gmail.com',
    name: 'e2e-user',
    updatedAt: 1584499597,
    validEmail: true,
    validName: true
  },
  {
    addedAt: 1584499697,
    email: `${testMailNamespace}.receiver${suffix}@inbox.testmail.app`,
    name: 'receiver',
    updatedAt: 1584499697,
    validEmail: true,
    validName: true
  },
  {
    addedAt: 1584599697,
    email: 'recipientEmailNotExist.forSure@gmail.com',
    name: 'recipientEmailNotExist',
    updatedAt: 1584599697,
    validEmail: true,
    validName: true
  },
  {
    addedAt: 1584599699,
    email: `${testMailNamespace}.sender${suffix}@inbox.testmail.app`,
    name: 'e2e test sender',
    updatedAt: 1584599699,
    validEmail: true,
    validName: true
  }
]

export { RECIPIENTS }
