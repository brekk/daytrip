import path from 'path'
import madge from 'madge'
import tree from 'dependency-tree'
import { fork, Future } from 'fluture'
import { inspect } from 'xtrace'
import {
  add,
  __ as $,
  apply,
  curry,
  filter,
  fromPairs,
  head,
  identity,
  includes,
  indexOf,
  lastIndexOf,
  map,
  mergeRight,
  objOf,
  nth,
  pipe,
  prop,
  reduce,
  reject,
  slice,
  split,
  memoizeWith,
  toPairs
} from 'ramda'

const madgic = sourceFile =>
  new Future((bad, good) => {
    madge(sourceFile, { includeNpm: true }).catch(bad).then(good)
    // good(tree({ filename: sourceFile }))
    return function cancel() {}
  })

const memo = memoizeWith(identity)

const pathtastic = memo(
  pipe(split(path.sep), reject(includes($, ['..'])))
)
const preslash = pipe(pathtastic, head)
const isNodeModule = includes('node_modules')
const getModule = pipe(pathtastic, nth(1))
const removeLastFolder = y =>
  pipe(lastIndexOf(path.sep), slice(0, $, y))(y)
const postslash = y =>
  pipe(indexOf(path.sep), slice($, Infinity, y))(y)
const file = y =>
  pipe(lastIndexOf(path.sep), add(1), slice($, Infinity, y))(y)

const relativeTo = curry((aliasMap, cwd, y) => {
  if (y.includes('_global.scss')) {
    console.log('ALIASMAP', aliasMap, cwd, y)
  }
  if (typeof y !== 'string') {
    return y
  }
  if (isNodeModule(y)) {
    return path.resolve(cwd, 'node_modules', getModule(y))
  }
  const aliased = aliasMap[preslash(y)]
  if (aliased) {
    const start = removeLastFolder(aliased)
    console.log('pre', aliased, 'post', start, 'cwd', cwd)
    const newpath = path.resolve(start, y)
    return newpath
  }
  return path.relative(cwd, y)
})

const remapDep = curry((cwd, dep) => {
  const rel =
    dep.indexOf(cwd) === 0 ? dep.slice(cwd.length + 1, Infinity) : dep
  if (dep.includes('node_modules')) {
    return [file(rel), 'node_modules']
  }
  if (dep.includes(cwd)) {
    return [rel, 'dependency']
  }
  return [dep, '?']
})

const remap = curry((cwd, deps) => {
  return reduce((agg, dep) => {
    const { modules = [], dependencies = [] } = agg
    const [local, context] = remapDep(cwd, dep)
    if (context === 'node_modules') {
      return mergeRight(agg, {
        modules: modules.concat(local)
      })
    }
    if (context === 'dependency') {
      return mergeRight(agg, {
        dependencies: dependencies.concat(local)
      })
    }
    return agg
  }, {})(deps)
})

const daytrip = (x, aliasMap) => {
  const cwd = process.cwd()
  const relative = relativeTo(aliasMap, cwd)
  return pipe(
    madgic,
    map(raw => raw.obj()),
    map(
      pipe(
        toPairs,
        map(([k, v]) => [relative(k), map(relative)(v)]),
        // fromPairs
        reduce(
          (agg, [k, v]) =>
            mergeRight(agg, objOf(remapDep(cwd, k), remap(cwd, v))),
          {}
        )
      )
    ),
    fork(console.warn)(console.log)
  )(x)
}

export default daytrip
