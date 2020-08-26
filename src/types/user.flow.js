// @flow

export type UserProfile = {
  googleId: string,
  imageUrl: ?string,
  email: string,
  name: string,
  givenName: string,
  familyName: string
}
export type EmailType = string

export type CloudWalletFolderMetaType = {
  fileId?: string,
  lastModified?: number, // timestamp，
  lastExported?: number // timestamp
}

export type RewardDataType = {
  rewardType: string,
  rewardValue: string,
  timestamp: string,
  // store any other meta info for a specified rewardType, e.g. transferId
  meta: Object
}