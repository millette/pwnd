'use strict'

// npm
require('dotenv').load()
const micro = require('micro')
const parse = require('urlencoded-body-parser')
const AsyncLRU = require('async-lru')

// core
const { promisify } = require('util')

// self
const isKnownPassword = require('.')

const max = process.env.max || 100000
const port = process.env.port || 3050

const lru = new AsyncLRU({
  max,
  load: (pw, cb) => isKnownPassword(pw)
    .then((x) => cb(null, x))
    .catch(cb)
})

const throwError = (code, str) => { throw micro.createError(code || 500, str || 'Error') }
const testPassword = promisify(lru.get.bind(lru))
const server = micro(async (req) => req.method.toUpperCase() === 'POST'
  ? parse(req)
    .then((x) => (x && x.password) ? x.password : throwError(400, 'Need password field.'))
    .then(testPassword)
    .then((ok) => ok ? { ok, msg: 'OK to use' } : { ok, msg: 'NOT ok to use' })
  : throwError(405, 'Method not allowed. Only POST is supported.')
)

server.listen(port)
