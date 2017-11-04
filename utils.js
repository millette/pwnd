'use strict'

// npm
const which = require('which')
const ProgressBar = require('progress')
const pipe = require('pump')
const through = require('through2')
const concat = require('concat-stream')

// core
const https = require('https')
const crypto = require('crypto')
const { basename } = require('path')
const fs = require('fs')
const { spawn } = require('child_process')

const width = 25

const which7z = (p) => new Promise((resolve, reject) => p
  ? which(p, (e, p7) => e ? reject(e) : resolve(p7))
  : which('7zr', (e1, p7zr) =>
    which('7za', (e2, p7za) => (e1 && e2) ? reject(new Error('7z binary not found.')) : resolve(p7zr || p7za))
  )
)

const unzip = (bin, file) => new Promise((resolve, reject) => {
  const sha1 = crypto.createHash('sha1')
  const steps = {}
  const out = fs.createWriteStream('wrk/' + basename(file.url, '.7z'))
  const ls = spawn(bin, ['e', '-so', 'dat/' + file.url])
  const opt = {
    total: file.size,
    width,
    head: '>',
    renderThrottle: 200,
    callback: () => { steps.callback = true }
  }
  const bar = new ProgressBar(`:bar :elapsed - eta :eta ${basename(file.url, '.txt.7z')}`, opt)
  const tick = (data) => bar.tick(data.length)
  ls.stdout.on('data', tick)
  ls.stdout.on('data', sha1.update.bind(sha1))
  pipe(ls.stdout, out, (error) => { steps.pipe = { error } })
  ls.on('error', (error) => { steps.error = error })
  ls.on('close', (code) => {
    if (steps.error) { return reject(steps.error) }
    if (steps.callback && steps.pipe && !code && !steps.pipe.error) {
      const digest = sha1.digest('hex')
      if (digest === file.sha1.txt) { return resolve(digest) }
      return reject(new Error(`sha1 sums don't match. Actual: ${digest} - Expected: ${file.sha1.txt}`))
    }
    if (code && !steps.callback) { return reject(new Error(`7z process exited with error code ${code}`)) }
    reject(new Error(`Unexpected error code: ${code} ${steps.error && steps.error.toString()} ${(steps.pipe && steps.pipe.error) || ''}`))
  })
})

const pwndFiles = require('./files.json')

const checkFile = (type, file) => new Promise((resolve, reject) => {
  if (type !== 'txt' && type !== '7z') { return reject(new Error('Bad type: txt or 7z expected')) }
  const filename = type === 'txt' ? `wrk/${basename(file.url, '.7z')}` : `dat/${file.url}`
  const sizeType = type === 'txt' ? 'size' : 'size7z'

  fs.stat(filename, (err, b) => {
    if (err) { return reject(err) }
    if (b.size !== file[sizeType]) { return reject(new Error('Sizes don\'t match')) }

    const opt = {
      total: file[sizeType],
      width,
      head: '>',
      renderThrottle: 200,
      callback: () => { console.log('el callback') }
    }
    const bar = new ProgressBar(`:bar :elapsed - eta :eta ${basename(file.url, '.txt.7z')}`, opt)
    const tru = through((chunk, enc, cb) => {
      bar.tick(chunk.length)
      cb(null, chunk)
    })

    let dig
    const ter = (x) => { dig = x.toString('hex') }
    pipe(
      fs.createReadStream(filename),
      tru,
      crypto.createHash('sha1'),
      concat(ter),
      (e) => {
        if (e) { return reject(e) }
        if (file.sha1[type] !== dig) { return reject(new Error('SHA1 doesn\'t match')) }
        resolve(true)
      })
  })
})

const checkTxtFile = checkFile.bind(null, 'txt')
const check7zFile = checkFile.bind(null, '7z')

const download = (file) => new Promise((resolve, reject) => {
  const yum = (res) => {
    if (res.statusCode !== 200) { return reject(new Error('Status code: ' + res.statusCode)) }
    const len = res.headers && res.headers['content-length'] && parseInt(res.headers['content-length'], 10)
    if (len !== file.size7z) { return reject(new Error('File size doesn\'t match')) }
    const sha1 = crypto.createHash('sha1')
    const out = fs.createWriteStream('dat/' + file.url)
    const opt = {
      total: file.size7z,
      width,
      head: '>',
      renderThrottle: 200
    }
    const bar = new ProgressBar(`:bar :elapsed - eta :eta ${basename(file.url, '.txt.7z')}`, opt)
    const tick = (data) => bar.tick(data.length)
    const update = sha1.update.bind(sha1)
    res.on('data', tick)
    res.on('data', update)

    pipe(
      res,
      out,
      (err) => {
        if (err) { return reject(err) }
        if (sha1.digest('hex') === file.sha1['7z']) { return resolve(true) }
        reject(new Error('SHA1 doesn\'t match'))
      }
    )
  }

  https.get(pwndFiles.urlRoot + file.url, yum)
    .once('error', reject)
})

const check = (bin, file) => checkTxtFile(file)
  .then(() => {}) // eat the first response (true)
  .catch(() => check7zFile(file))
  .catch(() => download(file))
  .then((x) => x ? unzip(bin, file) : false)

module.exports = { pwndFiles, unzip, which7z, checkTxtFile, check7zFile, download, check }
