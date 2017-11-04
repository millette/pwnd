'use strict'

// self
const utils = require('../utils')

utils.which7z()
  .then((bin) => utils.check(bin, utils.pwndFiles.files[2]))
  .then(console.log)
  .catch(console.error)
