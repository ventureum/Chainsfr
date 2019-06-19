/*
 * Basic token unit
 * 10^18 for ETH and Dai, 10^8 for BTC
 */
export type BasicTokenUnit = string

/*
 * Human readable standard token unit
 * float number of val/(10**decimals) with precision [precision]
 */
export type StandardTokenUnit = string

export type Address = string
