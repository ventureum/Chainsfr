const xpriv =
  'tprv8ZgxMBicQKsPeECfnKbHJbzLAtwksb22JEdvata2obsqz9dBijCXtUYm1Xh1FteMyEt4yFT1vH2SyGaQXaRaHRqbY9bDqJVeohhbZ76LXff'
const privateKey = 'cR5jPENTAYiJ3t4v9468KY4NjHokLGCAuznSWEWZzj7YRXt1BEdm'
const balance = 100000

const utxos = [
  {
    outputIndex: 1,
    script: 'a914b894ccf7a32b23c7a79fff1e08d217b1baacd71c87',
    txHash: '719ab5a99ea73ea4f1b2c2869845b9b1d150befce0566daa0c4cae45c63bded7',
    value: balance
  }
]
// cloud
const mockCloudBitcoinAccountData = {
  address: '2NA5CaRyYKAwnBGZpbwJu6DXvU9r7WzyfzM',
  balance: '0',
  balanceInStandardUnit: '0',
  connected: false,
  cryptoType: 'bitcoin',
  displayName: 'Bitcoin Cloud Wallet (Chainsfr Wallet)',
  encryptedPrivateKey: undefined,
  hdWalletVariables: {
    addresses: [],
    endAddressIndex: 0,
    endChangeIndex: 0,
    lastUpdate: 0,
    nextAddressIndex: 0,
    nextChangeIndex: 0,
    xpub:
      'tpubDCCcm4U25Atjud4iF8vLTncNqx47k3oqjNSWav3UhdsoRpyRU7uue7omdQCE1KRtqwgRar8oarN9jJyfRwn4oPQt3h7XumStnt4mJi851US',
    xpriv: xpriv
  },
  id:
    '{"cryptoType":"bitcoin","walletType":"drive","xpub":"tpubDCCcm4U25Atjud4iF8vLTncNqx47k3oqjNSWav3UhdsoRpyRU7uue7omdQCE1KRtqwgRar8oarN9jJyfRwn4oPQt3h7XumStnt4mJi851US"}',
  name: 'Bitcoin Cloud Wallet',
  privateKey: privateKey,
  receivable: true,
  sendable: true,
  status: 'INITIALIZED',
  verified: true,
  walletType: 'drive'
}

const mockCloudSyncedAccountData = {
  id:
    '{"cryptoType":"bitcoin","walletType":"drive","xpub":"tpubDCCcm4U25Atjud4iF8vLTncNqx47k3oqjNSWav3UhdsoRpyRU7uue7omdQCE1KRtqwgRar8oarN9jJyfRwn4oPQt3h7XumStnt4mJi851US"}',
  cryptoType: 'bitcoin',
  walletType: 'drive',
  address: '2NA5CaRyYKAwnBGZpbwJu6DXvU9r7WzyfzM',
  name: 'Bitcoin Cloud Wallet',
  displayName: 'Bitcoin Cloud Wallet (Chainsfr Wallet)',
  balance: balance.toString(),
  balanceInStandardUnit: '0.001',
  hdWalletVariables: {
    addresses: [
      {
        address: '2NA5CaRyYKAwnBGZpbwJu6DXvU9r7WzyfzM',
        path: "49'/1'/0'/0/0",
        utxos: utxos
      }
    ],
    endAddressIndex: 0,
    endChangeIndex: 0,
    lastUpdate: 1576696999,
    nextAddressIndex: 0,
    nextChangeIndex: 0,
    xpub:
      'tpubDCCcm4U25Atjud4iF8vLTncNqx47k3oqjNSWav3UhdsoRpyRU7uue7omdQCE1KRtqwgRar8oarN9jJyfRwn4oPQt3h7XumStnt4mJi851US',
    xpriv:
      'tprv8ZgxMBicQKsPeECfnKbHJbzLAtwksb22JEdvata2obsqz9dBijCXtUYm1Xh1FteMyEt4yFT1vH2SyGaQXaRaHRqbY9bDqJVeohhbZ76LXff'
  },
  connected: false,
  verified: true,
  receivable: true,
  sendable: true,
  status: 'SYNCED',
  privateKey: 'cR5jPENTAYiJ3t4v9468KY4NjHokLGCAuznSWEWZzj7YRXt1BEdm',
  encryptedPrivateKey: undefined
}

const mockLedgerBitcoinAccountData = {
  address: '',
  balance: '0',
  balanceInStandardUnit: '0',
  connected: false,
  cryptoType: 'bitcoin',
  displayName: 'Bitcoin Ledger Wallet (Ledger)',
  encryptedPrivateKey: undefined,
  hdWalletVariables: {
    addresses: [{
      address: '2NA5CaRyYKAwnBGZpbwJu6DXvU9r7WzyfzM',
      path: "49'/1'/0'/0/0",
      utxos: [
        {
          outputIndex: 1,
          script: 'a914b894ccf7a32b23c7a79fff1e08d217b1baacd71c87',
          txHash: '719ab5a99ea73ea4f1b2c2869845b9b1d150befce0566daa0c4cae45c63bded7',
          value: 100000
        }
      ]
    }],
    endAddressIndex: 0,
    endChangeIndex: 0,
    lastUpdate: 0,
    nextAddressIndex: 0,
    nextChangeIndex: 0,
    xpub:
      'tpubDCCcm4U25Atjud4iF8vLTncNqx47k3oqjNSWav3UhdsoRpyRU7uue7omdQCE1KRtqwgRar8oarN9jJyfRwn4oPQt3h7XumStnt4mJi851US',
    xpriv: xpriv
  },
  id:
    '{"cryptoType":"bitcoin","walletType":"ledger","xpub":"tpubDCCcm4U25Atjud4iF8vLTncNqx47k3oqjNSWav3UhdsoRpyRU7uue7omdQCE1KRtqwgRar8oarN9jJyfRwn4oPQt3h7XumStnt4mJi851US"}',
  name: 'Bitcoin Ledger Wallet',
  privateKey: privateKey,
  receivable: true,
  sendable: true,
  status: 'INITIALIZED',
  verified: true,
  walletType: 'ledger'
}

const mockLedgerSyncedAccountData = {
  id:
    '{"cryptoType":"bitcoin","walletType":"ledger","xpub":"tpubDCCcm4U25Atjud4iF8vLTncNqx47k3oqjNSWav3UhdsoRpyRU7uue7omdQCE1KRtqwgRar8oarN9jJyfRwn4oPQt3h7XumStnt4mJi851US"}',
  cryptoType: 'bitcoin',
  walletType: 'ledger',
  address: '2N8ZgzXSvVSGVf91HgdomXG4UF9wb7fbeyg',
  name: 'Bitcoin Ledger Wallet',
  displayName: 'Bitcoin Ledger Wallet (Ledger)',
  balance: balance.toString(),
  balanceInStandardUnit: '0.001',
  hdWalletVariables: {
    addresses: [
      {
        address: '2NA5CaRyYKAwnBGZpbwJu6DXvU9r7WzyfzM',
        path: "49'/1'/0'/0/0",
        utxos: [
          {
            outputIndex: 1,
            script: 'a914b894ccf7a32b23c7a79fff1e08d217b1baacd71c87',
            txHash: '719ab5a99ea73ea4f1b2c2869845b9b1d150befce0566daa0c4cae45c63bded7',
            value: 100000
          }
        ]
      },
      {
        address: '2N8ZgzXSvVSGVf91HgdomXG4UF9wb7fbeyg',
        path: "49'/1'/0'/0/1",
        utxos: []
      },
      { address: '2NCgXHXZrshRNUNKTJS2A3hBYUS6pSotxem', path: "49'/1'/0'/0/2", utxos: [] },
      {
        address: '2N7U4A7eCwcCjtTt6sgxZBmPc91dLR4sohv',
        path: "49'/1'/0'/0/3",
        utxos: []
      },
      {
        address: '2NCk4HDXraAs4q9yieV5icoUUsA4AtEeW9g',
        path: "49'/1'/0'/0/4",
        utxos: []
      },
      {
        address: '2N2aDqsbMWWkbvfvwHGpVCHehNbVszjBZ9L',
        path: "49'/1'/0'/0/5",
        utxos: []
      },
      {
        address: '2NBfCzceqQqkgzHAR9JFrnme9mnQ6HatdTV',
        path: "49'/1'/0'/0/6",
        utxos: []
      },
      {
        address: '2N43Gnj4bTRG41XaerqZfkJSWhfJ9cKVkEF',
        path: "49'/1'/0'/0/7",
        utxos: []
      },
      {
        address: '2N5wt6hVqM6ccnNxrawhU4T3VPZy9iVhY3a',
        path: "49'/1'/0'/0/8",
        utxos: []
      },
      {
        address: '2MuLz7DZWRCaodCzqSfw7y1NTPVoVYY5S84',
        path: "49'/1'/0'/0/9",
        utxos: []
      },
      {
        address: '2N6RsH1c1cQptyqiaYwhVhzDv862AoCNoPN',
        path: "49'/1'/0'/0/10",
        utxos: []
      },
      {
        address: '2NE2wVy6RFn4msUSncvbKtgiKrFWeRuXhyC',
        path: "49'/1'/0'/0/11",
        utxos: []
      },
      {
        address: '2NFQGWExa3ArgAA4E1SFhmb7vKErN8X5cRz',
        path: "49'/1'/0'/0/12",
        utxos: []
      },
      {
        address: '2MymRUkfRPHq9XafygYsBBTXn2NaZh3vqQw',
        path: "49'/1'/0'/0/13",
        utxos: []
      },
      {
        address: '2MyoGbi7dvPSwNrcLzzzVxdb2GWUANhwFwN',
        path: "49'/1'/0'/0/14",
        utxos: []
      },
      {
        address: '2MsUsWbTWvF8UqWgLr7iNxTq2T2W9zaSWDT',
        path: "49'/1'/0'/0/15",
        utxos: []
      },
      {
        address: '2MzHMFacDPzRSR384xGBXww3nzVchbQ8r4G',
        path: "49'/1'/0'/0/16",
        utxos: []
      },
      {
        address: '2MxbyBe2iSBbmDidnjjdU5e9g9en2PCzLNK',
        path: "49'/1'/0'/0/17",
        utxos: []
      },
      {
        address: '2MwgXbWSoX54Vgc3zGLydwF2wsYDsiHVxTA',
        path: "49'/1'/0'/0/18",
        utxos: []
      },
      {
        address: '2MvoT2DPFGPhZxWTtJBqzjUMQ87J1CXywSF',
        path: "49'/1'/0'/0/19",
        utxos: []
      },
      {
        address: '2N9QftFfZzcUi7DqFGnv2nAd2cyYgtazrZL',
        path: "49'/1'/0'/0/20",
        utxos: []
      },
      {
        address: '2MwSJbx2UhRrDksh5xyTKE4fasveMSDw392',
        path: "49'/1'/0'/1/0",
        utxos: []
      },
      {
        address: '2MuT7R2emXE9jwShn8wSrd8HEwJPaqtANKk',
        path: "49'/1'/0'/1/1",
        utxos: []
      },
      {
        address: '2N5ftyXi9y3R7vJ9vomAU5ibkoUGDjb1CEv',
        path: "49'/1'/0'/1/2",
        utxos: []
      },
      {
        address: '2N9jA27UCcrEmgmMJ8BPBg6j4V2ywmgJUrv',
        path: "49'/1'/0'/1/3",
        utxos: []
      },
      {
        address: '2N5k9SG1xuYCCKqwEMSiZmV1dCCfSr2zUxU',
        path: "49'/1'/0'/1/4",
        utxos: []
      },
      {
        address: '2Mz7hUd7QUqJSFKTzH9gUCkQhiB1BS15aSG',
        path: "49'/1'/0'/1/5",
        utxos: []
      },
      {
        address: '2N2wvBiknxRTinBG28Eaf7NmDsPigaq2jqr',
        path: "49'/1'/0'/1/6",
        utxos: []
      },
      {
        address: '2Mx5tQ4U8LELoUBD52AFLzyZwcomEyDoSRL',
        path: "49'/1'/0'/1/7",
        utxos: []
      },
      {
        address: '2N8uJiNeS8EjsEDnDUm3vmajv7xLMVgHk3J',
        path: "49'/1'/0'/1/8",
        utxos: []
      },
      {
        address: '2N6hHd3LpAdgKPno4hJLnyJJFpvnBDLM6J9',
        path: "49'/1'/0'/1/9",
        utxos: []
      },
      {
        address: '2N7okGWPpA6bc6k8BaMCUSnJ9AW41o6SUBn',
        path: "49'/1'/0'/1/10",
        utxos: []
      },
      {
        address: '2N9QZq2zGHzUVwTEyB41iCxNf8RyojvwaAn',
        path: "49'/1'/0'/1/11",
        utxos: []
      },
      {
        address: '2N1BSTwcQr2e9JahRVRbJWkkW3cfi6SFa7z',
        path: "49'/1'/0'/1/12",
        utxos: []
      },
      {
        address: '2NDJ1EiwfoBjPMTv9PqSc64QnvhdKyQmRfE',
        path: "49'/1'/0'/1/13",
        utxos: []
      },
      {
        address: '2NFvMNGbpiSrVxo1kQ1aBqMvSuBvPYyMU7z',
        path: "49'/1'/0'/1/14",
        utxos: []
      },
      {
        address: '2MvrCvTsDDbLDEYWspMSTa2sU9Tw1TnUEky',
        path: "49'/1'/0'/1/15",
        utxos: []
      },
      {
        address: '2MyxDLb1p2sTyGBjEykjoEzWtDkdk35Qsvt',
        path: "49'/1'/0'/1/16",
        utxos: []
      },
      {
        address: '2Mz6eh39AHw7eHN2KkGJfsvhFwCMutc4bAt',
        path: "49'/1'/0'/1/17",
        utxos: []
      },
      {
        address: '2NDasmAnL8vFKFG2i4eEsaTSbyyKh3THDUp',
        path: "49'/1'/0'/1/18",
        utxos: []
      },
      {
        address: '2NC6Lor2HCNMt8CxAaso2LirGTB5LzmLC7c',
        path: "49'/1'/0'/1/19",
        utxos: []
      }
    ],
    endAddressIndex: 21,
    endChangeIndex: 20,
    lastUpdate: 1576696999,
    nextAddressIndex: 1,
    nextChangeIndex: 0,
    xpub:
      'tpubDCCcm4U25Atjud4iF8vLTncNqx47k3oqjNSWav3UhdsoRpyRU7uue7omdQCE1KRtqwgRar8oarN9jJyfRwn4oPQt3h7XumStnt4mJi851US',
    xpriv:
      'tprv8ZgxMBicQKsPeECfnKbHJbzLAtwksb22JEdvata2obsqz9dBijCXtUYm1Xh1FteMyEt4yFT1vH2SyGaQXaRaHRqbY9bDqJVeohhbZ76LXff'
  },
  connected: false,
  verified: true,
  receivable: true,
  sendable: true,
  status: 'SYNCED',
  privateKey: 'cR5jPENTAYiJ3t4v9468KY4NjHokLGCAuznSWEWZzj7YRXt1BEdm',
  encryptedPrivateKey: undefined
}

const mockEscrowBitcoinAccountData = {
  address: '2NA5CaRyYKAwnBGZpbwJu6DXvU9r7WzyfzM',
  balance: '0',
  balanceInStandardUnit: '0',
  connected: false,
  cryptoType: 'bitcoin',
  displayName: 'Bitcoin Escrow Wallet (Escrow)',
  encryptedPrivateKey: undefined,
  hdWalletVariables: {
    addresses: [],
    endAddressIndex: 0,
    endChangeIndex: 0,
    lastUpdate: 0,
    nextAddressIndex: 0,
    nextChangeIndex: 0,
    xpub:
      'tpubDCCcm4U25Atjud4iF8vLTncNqx47k3oqjNSWav3UhdsoRpyRU7uue7omdQCE1KRtqwgRar8oarN9jJyfRwn4oPQt3h7XumStnt4mJi851US',
    xpriv: xpriv
  },
  id:
    '{"cryptoType":"bitcoin","walletType":"escrow","xpub":"tpubDCCcm4U25Atjud4iF8vLTncNqx47k3oqjNSWav3UhdsoRpyRU7uue7omdQCE1KRtqwgRar8oarN9jJyfRwn4oPQt3h7XumStnt4mJi851US"}',
  name: 'Bitcoin Escrow Wallet',
  privateKey: privateKey,
  receivable: true,
  sendable: true,
  status: 'INITIALIZED',
  verified: true,
  walletType: 'escrow'
}

const mockEscrowSyncedAccountData = {
  id:
    '{"cryptoType":"bitcoin","walletType":"escrow","xpub":"tpubDCCcm4U25Atjud4iF8vLTncNqx47k3oqjNSWav3UhdsoRpyRU7uue7omdQCE1KRtqwgRar8oarN9jJyfRwn4oPQt3h7XumStnt4mJi851US"}',
  cryptoType: 'bitcoin',
  walletType: 'escrow',
  address: '2NA5CaRyYKAwnBGZpbwJu6DXvU9r7WzyfzM',
  name: 'Bitcoin Escrow Wallet',
  displayName: 'Bitcoin Escrow Wallet (Escrow Wallet)',
  balance: balance.toString(),
  balanceInStandardUnit: '0.001',
  hdWalletVariables: {
    addresses: [
      {
        address: '2NA5CaRyYKAwnBGZpbwJu6DXvU9r7WzyfzM',
        path: "49'/1'/0'/0/0",
        utxos: utxos
      }
    ],
    endAddressIndex: 0,
    endChangeIndex: 0,
    lastUpdate: 1576696999,
    nextAddressIndex: 0,
    nextChangeIndex: 0,
    xpub:
      'tpubDCCcm4U25Atjud4iF8vLTncNqx47k3oqjNSWav3UhdsoRpyRU7uue7omdQCE1KRtqwgRar8oarN9jJyfRwn4oPQt3h7XumStnt4mJi851US',
    xpriv:
      'tprv8ZgxMBicQKsPeECfnKbHJbzLAtwksb22JEdvata2obsqz9dBijCXtUYm1Xh1FteMyEt4yFT1vH2SyGaQXaRaHRqbY9bDqJVeohhbZ76LXff'
  },
  connected: false,
  verified: true,
  receivable: true,
  sendable: true,
  status: 'SYNCED',
  privateKey: 'cR5jPENTAYiJ3t4v9468KY4NjHokLGCAuznSWEWZzj7YRXt1BEdm',
  encryptedPrivateKey: undefined
}

const tx = {
  hash: '719ab5a99ea73ea4f1b2c2869845b9b1d150befce0566daa0c4cae45c63bded7',
  received_at: '2019-12-17T21:18:49Z',
  lock_time: 0,
  block: {
    hash: '000000009e157af1f4140b003477c9e8a9cd43b93b0798973125dc35c526a2a6',
    height: 1612788,
    time: '2019-12-17T21:21:56Z'
  },
  inputs: [
    {
      input_index: 0,
      output_hash: '4d214a548cc61f48f8d8d42ed30d712e56a00b28e60065e8d5bc3afc9e594c88',
      output_index: 1,
      value: balance,
      address: '2NA5CaRyYKAwnBGZpbwJu6DXvU9r7WzyfzM',
      script_signature: '160014fe8b35a1b4cc4696a741aba5d7bd8ae1359fb1fd',
      txinwitness: [
        '304402207efaecb80274767fc863fc57af7425fff4494d4bb1664fb95ee2f46d7bf4411c02202b48387496cbd50312d6de7d939b1d389d85dc41c0727874fe12f1f9b856e5e001',
        '022eae7d0e2afee78800c07e59b0191c53b2a1ccdaf2cd0f985b16746498a4f491'
      ]
    }
  ],
  outputs: [
    {
      output_index: 1,
      value: balance,
      address: '2NA5CaRyYKAwnBGZpbwJu6DXvU9r7WzyfzM',
      script_hex: 'a914b894ccf7a32b23c7a79fff1e08d217b1baacd71c87'
    }
  ],
  fees: 2296,
  amount: 2824792,
  confirmations: 14757
}

const blockInfo = {
  name: 'BTC.test3',
  height: 1617405,
  hash: '000000000ab97b15172dd3210c6f45da458a3c806d1d3b151f7558ad13c8ae7d',
  time: '2019-12-18T18:57:45.657190806Z',
  latest_url:
    'https://api.blockcypher.com/v1/btc/test3/blocks/000000000ab97b15172dd3210c6f45da458a3c806d1d3b151f7558ad13c8ae7d',
  previous_hash: '000000000000caffb417664d326f00c7d07840e34cf4a0bb0918b369ff768734',
  previous_url:
    'https://api.blockcypher.com/v1/btc/test3/blocks/000000000000caffb417664d326f00c7d07840e34cf4a0bb0918b369ff768734',
  peer_count: 252,
  unconfirmed_count: 11383,
  high_fee_per_kb: 2214,
  medium_fee_per_kb: 2214,
  low_fee_per_kb: 2214,
  last_fork_height: 1613216,
  last_fork_hash: '00000000dfd510a80fb51eb3b1d401de7db31360e5e24ffe2341ab7108a8e466'
}

export {
  xpriv,
  privateKey,
  balance,
  mockCloudBitcoinAccountData,
  mockCloudSyncedAccountData,
  mockLedgerBitcoinAccountData,
  mockLedgerSyncedAccountData,
  mockEscrowBitcoinAccountData,
  mockEscrowSyncedAccountData,
  tx,
  blockInfo,
  utxos
}
