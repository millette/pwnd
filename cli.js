'use strict'

// self
const isKnownPassword = require('.')

isKnownPassword(process.argv[2] || 'password')
  .then(console.log)
  .catch(console.error)
