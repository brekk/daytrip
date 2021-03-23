import fg from 'fast-glob'
import { Future } from 'fluture'

export const glob = input =>
  new Future((bad, good) => {
    fg(input).catch(bad).then(good)
    /* istanbul ignore next */
    return function cancel() {}
  })

