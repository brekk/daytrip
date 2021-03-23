import { glob } from './files'
import { fork } from './utils'

test('glob', done => {
  const futureGlob = glob(`${__dirname}/*.js`)
  fork(
    done,
    output => {
      expect(output).toMatchSnapshot()
      done()
    },
    futureGlob
  )
})
