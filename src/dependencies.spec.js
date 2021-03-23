import { getAliasedPath } from './dependencies'
import { dirAndFile } from './string'

const aliases = {
  components:
    '/cool/dir/work/charly/superdesk-browser3/src/components',
  layout: '/cool/dir/work/charly/superdesk-browser3/src/layout',
  api: '/cool/dir/work/charly/superdesk-browser3/src/api',
  modules: '/cool/dir/work/charly/superdesk-browser3/src/modules',
  pages: '/cool/dir/work/charly/superdesk-browser3/src/pages',
  setup: '/cool/dir/work/charly/superdesk-browser3/src/setup',
  services: '/cool/dir/work/charly/superdesk-browser3/src/services',
  sharedComponents:
    '/cool/dir/work/charly/superdesk-browser3/src/sharedComponents',
  utils: '/cool/dir/work/charly/superdesk-browser3/src/utils',
  assets: '/cool/dir/work/charly/superdesk-browser3/assets'
}

test('getAliasedPath', () => {
  const givenFile = 'src/daytrip.js'
  const dependency = '../package.json'
  expect(
    dirAndFile(
      getAliasedPath(aliases, __dirname, givenFile, dependency)
    )
  ).toEqual('daytrip/package.json')
})
test('getAliasedPath - nested', () => {
  expect(
    getAliasedPath(
      aliases,
      __dirname,
      'node_modules/debug/src/index.js',
      './common'
    )
  ).toEqual('/node_modules/debug/src/common')
})

test('getAliasedPath - aliased', () => {
  expect(
    getAliasedPath(
      aliases,
      __dirname,
      'sharedComponents/formComponents/awesome.js',
      '../sharedSauce'
    )
  ).toEqual(
    '/cool/dir/work/charly/superdesk-browser3/src/sharedComponents/sharedSauce'
  )
})
