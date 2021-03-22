import fg from 'fast-glob'
import { readFile } from 'torpor'
import { fork as rawFork, Future, chain, parallel } from 'fluture'
import { trace } from 'xtrace'
import {
  __ as $,
  ap,
  curry,
  includes,
  indexOf,
  either,
  keys,
  map,
  mergeRight,
  of,
  pipe,
  propOr,
  slice,
  reduce
} from 'ramda'
import precinct from 'precinct'

const glob = dir =>
  new Future((bad, good) => {
    fg(`${dir}/**/*.*`).catch(bad).then(good)
    return function cancel() {}
  })
const pretack = curry((raw, x) => [raw, x])
const keysOf = curry((pr, raw) => pipe(propOr({}, pr), keys)(raw))
const getAllDependencies = pipe(
  of,
  ap([
    keysOf('dependencies'),
    keysOf('devDependencies'),
    keysOf('peerDependencies')
  ]),
  ([s, d, p]) => s.concat(d).concat(p)
)

const preslash = filepath =>
  pipe(indexOf('/'), slice(0, $, filepath))(filepath)

const isDependency = curry((pkg, dep) =>
  pipe(
    getAllDependencies,
    either(includes(dep), includes(preslash(dep)))
  )(pkg)
)

export const fork = curry((bad, good, future) =>
  rawFork(bad)(good)(future)
)

export const daytrip = curry((aliases, pkg, dir) =>
  pipe(
    glob,
    map(
      map(file =>
        pipe(
          readFile($, 'utf8'),
          map(
            pipe(
              precinct,
              reduce(
                (agg, dep) => {
                  const { modules: m, dependencies: d } = agg
                  const isModule = isDependency(pkg, dep)
                  const dependencies = !isModule ? d.concat(dep) : d
                  const modules = isModule ? m.concat(dep) : m
                  return mergeRight(agg, { modules, dependencies })
                },
                { modules: [], dependencies: [] }
              ),
              mergeRight({ file })
            )
          )
        )(file)
      )
    ),
    chain(parallel(100))
  )(dir)
)

export default daytrip
