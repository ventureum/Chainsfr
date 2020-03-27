const sleep = milliseconds => {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve()
    }, milliseconds)
  })
}

const runUntilEvaluateEquals = (fn, value, opts = {}) => {
  if (opts.interval === undefined) opts.interval = 500
  if (opts.comparator === undefined) opts.comparator = (a, b) => a === b
  return new Promise((resolve, reject) => {
    ;(function wait () {
      if (!opts.comparator(fn(), value)) {
        setTimeout(wait, opts.interval)
      } else {
        resolve()
      }
    })()
  })
}

const getNewPopupPage = async (browser, triggerFunction) => {
  let pagesBeforeOpen = await browser.pages()
  await triggerFunction()
  var pageCount = 0
  await runUntilEvaluateEquals(function () {
    ;(async function () {
      pageCount = (await browser.pages()).length
    })()
    return pageCount
  }, pagesBeforeOpen.length + 1)

  const browserPages = await browser.pages()
  const newPopup = browserPages.reduce(function (acc, curr) {
    if (!pagesBeforeOpen.includes(curr)) {
      return curr
    } else {
      return acc
    }
  })
  return newPopup
}

async function getElementTextContent (elementHandle) {
  const text = await (await elementHandle.getProperty('textContent')).jsonValue()
  return text
}

export { sleep, runUntilEvaluateEquals, getNewPopupPage, getElementTextContent }
