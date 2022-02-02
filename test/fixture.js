import tap from 'tap'
import run from '../src/index.js'
import stream from 'stream'
import concat from 'concat-stream'
import debugFunc from 'debug'
const debug = debugFunc('all:test')

function testString(input, expected) {
  tap.test('basic test', t => {
    run({
      in: { name: 'stdin', createStream: () => stream.Readable.from(input) }, out: {
        name: 'stdout', createStream: () => concat({}, (body) => {
          // fs.writeFileSync('build/' + path.basename(options.in.name) + '.json', body, { flag: 'w' });
          debug('body=', body)
          t.equal(body, expected)
          t.end()
        })
      }
    })
  })
}

export {
  testString
}
