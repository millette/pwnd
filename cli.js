'use strict'

// self
const isKnownPassword = require('.')

isKnownPassword('password')
  .then(console.log)
  .catch(console.error)
