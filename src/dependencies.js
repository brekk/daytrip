import path from 'path'
import {
  either,
  includes,
  curry,
  pipe,
  propOr,
  keys,
  of,
  ap
} from 'ramda'
import { preslash, postslash } from './string'

export const keysOf = curry((pr, raw) =>
  pipe(propOr({}, pr), keys)(raw)
)
export const getAllDependencies = pipe(
  of,
  ap([
    keysOf('dependencies'),
    keysOf('devDependencies'),
    keysOf('peerDependencies')
  ]),
  ([s, d, p]) => s.concat(d).concat(p)
)

export const isDependency = curry((pkg, dep) =>
  pipe(
    getAllDependencies,
    either(includes(dep), includes(preslash(dep)))
  )(pkg)
)

/*
const aliases = {
  components: '/Users/brekk/work/charly/superdesk-browser3/src/components',
  layout: '/Users/brekk/work/charly/superdesk-browser3/src/layout',
  api: '/Users/brekk/work/charly/superdesk-browser3/src/api',
  modules: '/Users/brekk/work/charly/superdesk-browser3/src/modules',
  pages: '/Users/brekk/work/charly/superdesk-browser3/src/pages',
  setup: '/Users/brekk/work/charly/superdesk-browser3/src/setup',
  services: '/Users/brekk/work/charly/superdesk-browser3/src/services',
  sharedComponents: '/Users/brekk/work/charly/superdesk-browser3/src/sharedComponents',
  utils: '/Users/brekk/work/charly/superdesk-browser3/src/utils',
  src: '/Users/brekk/work/charly/superdesk-browser3/src',
  assets: '/Users/brekk/work/charly/superdesk-browser3/assets'
}
*/
export const getAliasedPathFrom = curry((aliases, x) => {
  const alias = aliases[preslash(x)] || false
  if (alias) {
    return path.join(alias, x)
  }
  return x
})
export const getAliasedPath = curry((aliases, a, b) => {
  const aliasedName = getAliasedPathFrom(aliases)
  const relativeTo = aliasedName(a)
  const filepath = aliasedName(b)
  if (a !== relativeTo) {
    console.log('aliased a!', a, '->', relativeTo)
  }
  if (b !== filepath) {
    console.log('aliased b!', b, '->', filepath)
  }
  if (filepath.startsWith('.')) {
    return path.join(
      path.dirname(filepath),
      path.parse(filepath).base
    )
  } else {
  }
  return filepath
})
