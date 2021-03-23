import { readFile } from 'torpor'
import { chain, parallel } from 'fluture'
import { __ as $, curry, map, mergeRight, pipe, reduce } from 'ramda'
import precinct from 'precinct'
import { glob } from './files'
import { getAliasedPath, isDependency } from './dependencies'

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
                  const filepath = getAliasedPath(aliases, file, dep)
                  const isModule = isDependency(pkg, filepath)
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
  )(`${dir}/**/*.*`)
)

export default daytrip
