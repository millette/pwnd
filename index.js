'use strict'

// core
const crypto = require('crypto')
const { promisify } = require('util')
const open = promisify(require('fs').open)
const read = promisify(require('fs').read)
const fstat = promisify(require('fs').fstat)

const precision = 6
const lineLength = 42
const size = 10000 * lineLength
const maxEstimate = parseInt('f'.repeat(precision), 16)
const reDig = /^[0-9A-F]{40}$/

const makeDig = (pw) => {
  const t = pw.toUpperCase()
  if (t.match(reDig)) { return t }
  const hash = crypto.createHash('sha1')
  hash.update(pw)
  return hash.digest('hex').toUpperCase()
}

const binarySearch = async ({ fd, fsize, pw }) => {
  const dig = makeDig(pw)
  let lowest = 0
  let highest = fsize
  const newSearch = () => searchAt(lineLength * Math.round((lowest + highest) / 2 / lineLength))
  const searchAt = async (pos) => {
    const buf = Buffer.alloc(size)
    const { buffer } = await read(fd, buf, 0, size, pos)
    const found = buffer.indexOf(dig)
    if (found !== -1) { return { found: true } }
    const c = buffer.toString().split('\r\n').filter(Boolean)
    if (dig < c[0]) {
      highest = pos + buffer.length
      return newSearch()
    }
    if (dig < c[c.length - 1]) { return { found: false } }
    lowest = pos
    return newSearch()
  }
  const est = parseInt(dig.slice(0, precision), 16) / maxEstimate * fsize - (size / 2)
  const pos = lineLength * Math.round(est / lineLength)
  return searchAt(pos)
}

const searchPasswordIn = async (pw, fn) => {
  try {
    const fd = await open(fn, 'r')
    const { size } = await fstat(fd)
    return Promise.resolve({ fd, fsize: size, pw }).then(binarySearch)
  } catch (error) { return { error } }
}

const isKnownPassword = (pw) => Promise.all([
  searchPasswordIn(pw, 'pwned-passwords-1.0.txt'),
  searchPasswordIn(pw, 'pwned-passwords-update-1.txt'),
  searchPasswordIn(pw, 'pwned-passwords-update-2.txt')
])
  .then((x) => x.filter((y) => y.found).length === 0)

/*
  .then((x) => {
    let found = false
    x.forEach((y) => { found = found || y.found })
    return !found
  })
*/

isKnownPassword('piesapple')
  .then(console.log)
  .catch(console.error)
