## What is Drive wallet?

Drive Wallet is a Google-powered cryptocurrency wallet, automatically created during registration. It abstracts out private key management to a third party system - Google Drive, 
which enables users to create/store private keys, transfer cryptocurrencies - all without having to install any software.

The majority of the crypto community may not mind the complexities of entering in 42-character addresses or securing private keys, but the wider public does.
Drive wallet automates accounts creations and private key management and makes the process of using cryptocurrencies smoother.

The private keys are securely stored in user's Goolge Drive, **encrypted with a password provided by the user** . We store them in the following locations:
> * [appDataFolder](https://developers.google.com/drive/api/v3/appdata)
    -  The App Folder is a special folder that is only accessible to our applications. Its content is hidden from the user and other apps. Despite being hidden from the user, the App Folder is stored on the user's Drive and therefore uses the user's Drive storage quota.
> * [Drive Folder](https://www.google.com/drive/)
    - A backup of private keys is stored in "\_\_ChainsferData\_\_" folder in the user's Google Drive. The backup is accessible by users.

The wallet provides the following functions:
> * Private Key Management
> * Send and Receive cryptocurrencies
> * Email Transfer Service

## Does Chainsfer.io have access to my private keys?

All sensitive user data are encrypted with [Advanced Encryption Standard ](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard).
We will not have access to your private keys, passwords or funds at any time, preserving your privacy and control. Google will also not have access to your funds, as only you know the password that decrypts your encrypted private keys.

## What cryptocurrency does it support?

The following table lists all supported cryptocurrencies:
    - Ethereum
    - Bitcoin
    - Dai

More will be added to the list in the upcoming updates.

## Is it free?

Drive Wallet is free and open source.