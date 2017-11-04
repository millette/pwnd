'use strict'

// self
const isKnownPassword = require('.')

isKnownPassword(process.argv[2] || 'password')
  .then((x) => {
    if (x) {
      process.exitCode = 0
      console.log('Password hasn\'t leaked yes. You can probably use it (careful not to reuse passwords).')
    } else {
      process.exitCode = 1
      console.log('Password has already leaked. Do not reuse it (or any password, for that matter).')
    }
  })
  .catch((error) => {
    console.error('There was a problem reading files in wrk/ directory. Did you run node scripts/init first?')
    console.error(error)
    process.exitCode = 2
  })
