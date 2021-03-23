import { preslash } from './string'

test('preslash', () => {
  expect(preslash('a/b/c/d/e')).toEqual('a')
})
