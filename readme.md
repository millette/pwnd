# pwnd
[![Build Status](https://travis-ci.org/millette/pwnd.svg?branch=master)](https://travis-ci.org/millette/pwnd)
[![Coverage Status](https://coveralls.io/repos/github/millette/pwnd/badge.svg?branch=master)](https://coveralls.io/github/millette/pwnd?branch=master)
[![Dependency Status](https://gemnasium.com/badges/github.com/millette/pwnd.svg)](https://gemnasium.com/github.com/millette/pwnd)
> Find out if your password is out there.

This module would not be possible without the [haveibeenpwned][] project.

## Password files
Grab the 3 password files from <https://haveibeenpwned.com/Passwords>, about 5.4 GiB in total, and decompress them where you installed this package. You'll need [7zip][] or 7zip-full to decompress. 7zip is sufficient.

```
7zr e pwned-passwords-update-2.txt.7z # with 7zip
7z e pwned-passwords-update-2.txt.7z # with 7zip-full
```

The plan is to eventually automate this process, perhaps even have the password files available through [dat][] (peer-to-peer).

## Command-line interface
A small cli is provided:

```
node cli # tests "password" by default
node cli banana # tests the given argument
```

## http server
A small web server is provided, responding to POST queries only.

```
node server # only outputs on errors, ctrl-c to quit
curl http://localhost:3050/ -d password=fav55ing
curl http://localhost:3050/ -d password=apple
```

The password key is required. The JSON response will have a boolean "ok" key: true means the password is absent from the password files; false means it's in (or out) there and you should not (re)use it.

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
