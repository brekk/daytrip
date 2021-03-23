import path from 'path'
import {
  pipe,
  memoizeWith,
  identity,
  indexOf,
  join,
  slice,
  split,
  __ as $
} from 'ramda'
import { trace } from 'xtrace'

export const preslash = filepath =>
  pipe(indexOf(path.sep), slice(0, $, filepath))(filepath)

export const postslash = filepath =>
  pipe(indexOf(path.sep), slice($, Infinity, filepath))(filepath)

export const patharray = memoizeWith(identity)(split(path.sep))
export const dirAndFile = pipe(
  patharray,
  slice(-2, Infinity),
  join(path.sep)
)
