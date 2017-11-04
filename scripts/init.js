'use strict'

// npm
const disk = require('diskusage')

// self
const utils = require('../utils')

console.log('It takes a few minutes to download, verify and decompress 13 GiB. Please be patient.')

disk.check('.', (err, info) => {
  if (err) { return console.error(err) }
  if (info.available < 20e9) {
    console.log('You need at least 20 GiB free to download and decompress the files.')
    return
  }

  utils.which7z()
    .then((bin) => Promise.all([bin, utils.check(bin, utils.pwndFiles.files[2])]))
    .then(([bin]) => Promise.all([bin, utils.check(bin, utils.pwndFiles.files[1])]))
    .then(([bin]) => utils.check(bin, utils.pwndFiles.files[0]))
    .then(console.log)
    .catch(console.error)
})
