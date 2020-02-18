export const platformSelections = [
  {
    platformType: 'ethereum',
    title: 'Ethereum'
  },
  {
    platformType: 'bitcoin',
    title: 'Bitcoin'
  }
]

export function getPlatformTitle (platformType) {
  const p = platformSelections.find(platform => {
    return platformType === platform.platformType
  })
  return p.title
}
