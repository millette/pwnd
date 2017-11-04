'use strict'

// npm
require('dotenv').load()

// core
const crypto = require('crypto')
const { promisify } = require('util')
const open = promisify(require('fs').open)
const close = promisify(require('fs').close)
const read = promisify(require('fs').read)
const fstat = promisify(require('fs').fstat)

// self
const utils = require('./utils')

const precision = process.env.precision || 6
const lineLength = 42
const size = (process.env.size || 10000) * lineLength
const maxEstimate = parseInt('f'.repeat(precision), 16)
const reDig = /^[0-9A-F]{40}$/

const makeDig = (pw) => {
  const t = pw.toUpperCase()
  if (t.match(reDig)) { return t }
  const hash = crypto.createHash('sha1')
  hash.update(pw)
  return hash.digest('hex').toUpperCase()
}

const doneNotFound = (found) => { return { found } }
const doneFound = () => doneNotFound(true)

const binarySearch = async ({ fd, fsize, pw }) => {
  const dig = makeDig(pw)
  let lowest = 0
  let highest = fsize
  const newSearch = () => searchAt(lineLength * Math.round((lowest + highest) / 2 / lineLength))
  const searchAt = async (pos) => {
    const buf = Buffer.alloc(size)
    const { buffer } = await read(fd, buf, 0, size, pos)
    const found = buffer.indexOf(dig)
    if (found !== -1) { return close(fd).then(doneFound) }
    const c = buffer.toString().split('\r\n').filter(Boolean)
    if (dig < c[0]) {
      highest = pos + buffer.length
      return newSearch()
    }
    if (dig < c[c.length - 1]) { return close(fd).then(doneNotFound) }
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

const pwndFiles = utils.pwndFiles.files.map(utils.wrkName).reverse()

module.exports = (pw, n) => {
  const files = n ? pwndFiles.slice(0, n) : pwndFiles.slice()
  const fn = searchPasswordIn.bind(null, pw)
  return Promise.all(files.map(fn))
    .then((x) => x.filter((y) => y.found).length === 0)
}
