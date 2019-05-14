import React, { Component } from 'react'

import { connect } from 'react-redux'
import FAQComponent from '../components/FAQComponent'

const DOC_SECTION_ID = {
  GENERAL: 'general',
  SENDING: 'sending',
  RECEIVING: 'receiving',
  CANCELLING: 'cancelling',
  WALLET: 'drive-wallet'
}

const DOC_MAP = {
  '/': DOC_SECTION_ID.GENERAL,
  '/send': {
    0: DOC_SECTION_ID.SENDING,
    1: DOC_SECTION_ID.SENDING,
    2: DOC_SECTION_ID.SENDING,
    3: DOC_SECTION_ID.SENDING,
    4: DOC_SECTION_ID.SENDING
  },
  '/receive': {
    0: DOC_SECTION_ID.RECEIVING,
    1: DOC_SECTION_ID.RECEIVING,
    2: DOC_SECTION_ID.RECEIVING,
    3: DOC_SECTION_ID.RECEIVING,
    4: DOC_SECTION_ID.RECEIVING
  },
  '/cancel': {
    0: DOC_SECTION_ID.CANCELLING,
    1: DOC_SECTION_ID.CANCELLING
  },
  '/wallet': DOC_SECTION_ID.WALLET
}

class FAQContainer extends Component {
  render () {
    let { navigation, location } = this.props
    let docId = null
    let path = location.pathname
    if (['/', '/send', '/receive', '/cancel', '/wallet'].includes(path)) {
      if (typeof DOC_MAP[path] === 'string') {
        docId = DOC_MAP[path]
      } else {
        // with navigation steps
        docId = DOC_MAP[path][navigation[path.slice(1)]]
      }
    } else {
      // default for all other pages
      docId = DOC_MAP['/']
    }
    return <FAQComponent docId={docId} />
  }
}

const mapStateToProps = state => {
  return {
    navigation: state.navigationReducer,
    location: state.router.location
  }
}

export default connect(mapStateToProps)(FAQContainer)
