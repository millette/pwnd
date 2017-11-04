'use strict'

// self
const utils = require('../utils')

utils.which7z()
  .then((bin) => Promise.all([bin, utils.check(bin, utils.pwndFiles.files[2])]))
  .then(([bin]) => Promise.all([bin, utils.check(bin, utils.pwndFiles.files[1])]))
  .then(([bin]) => utils.check(bin, utils.pwndFiles.files[0]))
  .then(console.log)
  .catch(console.error)
