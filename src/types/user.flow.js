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
  fileId: string,
  lastModified: number // timestamp
}
