'use strict'

// npm
const micro = require('micro')
const parse = require('urlencoded-body-parser')

// self
const isKnownPassword = require('.')

const throwError = (code, str) => { throw micro.createError(code || 500, str || 'Error') }
const server = micro(async (req) => req.method.toUpperCase() === 'POST'
  ? parse(req)
    .then((x) => (x && x.password) ? x.password : throwError(400, 'Need password field.'))
    .then(isKnownPassword)
    .then((ok) => ok ? { ok, msg: 'OK to use' } : { ok, msg: 'NOT ok to use' })
  : throwError(405, 'Method not allowed. Only POST is supported.')
)

server.listen(3050)
