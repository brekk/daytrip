import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import shebang from 'rollup-plugin-add-shebang'
import pkg from './package.json'

const external = (pkg && pkg.dependencies
  ? Object.keys(pkg.dependencies)
  : []
).concat([
  `path`,
])

const plugins = [
  json(),
  resolve({ preferBuiltins: true }),
  commonjs()
]

export default [
  {
    input: `src/daytrip.js`,
    external,
    output: [{ file: pkg.bin.daytrip, format: `cjs` }],
    plugins: plugins
  }
  
]
