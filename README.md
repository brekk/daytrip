# daytrip

1. given a folder, a list of aliases and a package.json file, walk all files
2. determine `import` / `require` statements
3. map those to either `dependencies` / `modules`
4. profit?

This module is a _work-in-progress_!

Example:
```js
const {pipe} = require('ramda')
const {daytrip, fork} = require('daytrip');

const pkg = require('./package.json');
const pack = require('./webpack.base.config');
const alias = pack.resolve.alias;

pipe(
  daytrip(alias, pkg),
  fork(console.warn)(console.log)
)('src')
```
