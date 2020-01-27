import React, {  useEffect } from 'react'

export default function OAuthRedirectComponent (props) {
  useEffect(() => {
    // get the URL parameters which will include the auth token
    const params = window.location.search
    if (window.opener) {
      // send them to the opening window
      window.opener.postMessage({ type: 'coinbase_auth', params: params })
      // close the popup
      window.close()
    }
  })
  
  return <div>Please wait</div>
}
