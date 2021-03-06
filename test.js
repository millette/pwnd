'use strict'

// npm
import test from 'ava'

// self
import fn from '.'
import utils from './utils'

test('password, small file', async t => {
  const ret = await fn('password', 1)
  t.is(ret, true)
})

test.skip('password, all files', async t => {
  const ret = await fn('password')
  t.is(ret, false)
})

test('passétéword, small file', async t => {
  const ret = await fn('passétéword', 1)
  t.is(ret, true)
})

test.skip('passétéword, all files', async t => {
  const ret = await fn('passétéword')
  t.is(ret, true)
})

test('hashed, small file', async t => {
  const ret = await fn('0000C1BDAB3A615C3B636084CC33171482948D5A', 1)
  t.is(ret, false)
})

test('wrk', t => {
  t.is(utils.wrkName({ url: 'bob.7z' }), 'wrk/bob')
})
