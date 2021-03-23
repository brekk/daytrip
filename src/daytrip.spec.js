import pkg from '../package.json'
import { daytrip } from './daytrip'
import { fork } from './utils'

test('daytrip', done => {
  fork(
    done,
    out => {
      expect(out).toMatchSnapshot()
      done()
    },
    daytrip({}, pkg, 'src')
  )
})
