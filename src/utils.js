import { fork as rawFork } from 'fluture'
import { curry } from 'ramda'

export const fork = curry((bad, good, future) =>
  rawFork(bad)(good)(future)
)
export const pretack = curry((raw, x) => [raw, x])
