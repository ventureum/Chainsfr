const polyfill = require('babel-polyfill')

import Transport from "@ledgerhq/hw-transport-node-hid"
// import Transport from "@ledgerhq/hw-transport-web-usb";
// import Transport from "@ledgerhq/react-native-hw-transport-ble";
import AppBtc from "@ledgerhq/hw-app-btc"

async function main () {
  const transport = await Transport.create()
  const btc = new AppBtc(transport)
  const result = await btc.getWalletPublicKey("44'/0'/0'/0/0")
  return result.bitcoinAddress
}

main()
