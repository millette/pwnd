# pwnd
[![Build Status](https://travis-ci.org/millette/pwnd.svg?branch=master)](https://travis-ci.org/millette/pwnd)
[![Coverage Status](https://coveralls.io/repos/github/millette/pwnd/badge.svg?branch=master)](https://coveralls.io/github/millette/pwnd?branch=master)
[![Dependency Status](https://gemnasium.com/badges/github.com/millette/pwnd.svg)](https://gemnasium.com/github.com/millette/pwnd)
> Find out if your password is out there.

This module would not be possible without the [haveibeenpwned][] project.

## Requirements
Written in server-side JavaScript and tested on Debian GNU/Linux.

### node
You'll need the latest LTS, node 8.9.0 or above.

### 7-zip
You'll need [7zip][] or 7zip-full to decompress. 7zip is sufficient.

## Password files
Grab the 3 password files from <https://haveibeenpwned.com/Passwords>, about 5.4 GiB in total, and decompress them to the wrk/ directory.

The simplest way to download and decompress the files is with the init.js script:

```
node scripts/init
```

You only have to run this once. If you run it again, it will verify the SHA1 signatures only.

You can safely delete dat/\*.txt.7z after running init successfully if you don't plan on sharing those files with dat. Running init again will pick up the wrk/\*.txt files, which are required.

The plan is to eventually automate this process, perhaps even have the password files available through [dat][] (peer-to-peer).

### Dat
You can also use [dat][] to download the files. It's not needed for scripts/init.js to work but it can help spread these password files. If you don't have the dat cli:

```
npm install -g dat
```

If you have dat and want to help share bandwidth costs, you can download the 3 files with:

```
dat clone dat://d5910c23a5d3468d74d0f0f9b76fb8b6e15068fa253b0c9bafd8a021dac62fe3 dat
node scripts/init # will skip the download, but will verify and decompress in the correct place
```

If you already used dat to get the 3 password files and would like to share them:

```
cd dat
dat . # ctrl-c to end sharing
```

## Command-line interface
A small cli is provided:

```
node cli # tests "password" by default
node cli banana # tests the given argument
```

Careful to quote complicated passwords on the command-line, perhaps start with 'password'.

## http server
A small web server is provided, responding to POST queries only.

```
node server # only outputs on errors, ctrl-c to quit
curl http://localhost:3050/ -d password=fav55ing
curl http://localhost:3050/ -d password=apple
```

The password key is required. The JSON response will have a boolean "ok" key: true means the password is absent from the password files; false means it's in (or out) there and you should not (re)use it.

Once you have the server running, you can open another terminal and now have a slightly faster cli:

```
node cli --use-server # tests "password" by default
node cli banana -s # order doesn't matter; -s is an alias for --use-server
```

Careful to quote complicated passwords on the command-line, perhaps start with 'password'.

## Configuration
You can set values in the environment (which takes precedence) or in the .env file. Out of the box, the content is the following, which are also the hardcoded default values.

```
max=100000
port=3050
precision=6
size=10000
```

"port" and "max" are only used in the web server. Max is the number of passwords to keep in cache.

"precision" and "size" can both be tweaked to tune the binary search.

[dat]: https://datproject.org/
[haveibeenpwned]: https://haveibeenpwned.com/
[7zip]: http://www.7-zip.org/
