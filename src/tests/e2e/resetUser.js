import { resetUserDefault } from './utils/reset.js'

(async () => {
  try {
    await resetUserDefault()
  } catch (e) {
    console.log(e)
  }
})()
