'use strict'

// core
const http = require('http')
const { parse } = require('url')

const args = process.argv.slice(2)

const serverFlags = ['-s', '--use-server']
const password = args.filter((x) => x[0] !== '-')[0] || 'password'
const url = Object.assign({ method: 'POST' }, parse(`http://localhost:${process.env.port || 3050}/`))

const client = (pw) => new Promise((resolve, reject) => http
  .request(url, (res) => {
    let str = ''
    res.on('data', (d) => { str += d })
    res.on('end', () => {
      if (!str) { return reject(new Error('Response was empty.')) }
      try {
        resolve(JSON.parse(str).ok)
      } catch (e) {
        reject(e)
      }
    })
  })
  .on('error', reject)
  .end(`password=${encodeURIComponent(pw)}`)
)

const isKnownPassword = args.filter((x) => serverFlags.indexOf(x) !== -1).length ? client : require('.')

const done = (x) => {
  if (x) {
    process.exitCode = 0
    console.log('Password hasn\'t leaked yes. You can probably use it (careful not to reuse passwords).')
  } else {
    process.exitCode = 1
    console.log('Password has already leaked. Do not reuse it (or any password, for that matter).')
  }
}

const bad = (error) => {
  console.error('There was a problem reading files in wrk/ directory. Did you run node scripts/init first?')
  console.error(error)
  process.exitCode = error.errno ? (Math.abs(error.errno) + 10) : 2
}

isKnownPassword(password)
  .then(done)
  .catch(bad)
