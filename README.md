# walkable-buffer

[![npm version](https://badgen.net/npm/v/walkable-buffer)](https://www.npmjs.com/package/walkable-buffer)
[![install size](https://badgen.net/packagephobia/publish/walkable-buffer)](https://packagephobia.now.sh/result?p=walkable-buffer)
[![minified size](https://badgen.net/bundlephobia/min/walkable-buffer)](https://bundlephobia.com/result?p=walkable-buffer)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=oBusk/walkable-buffer)](https://dependabot.com)
[![Build Status](https://travis-ci.org/oBusk/walkable-buffer.svg?branch=master)](https://travis-ci.org/oBusk/walkable-buffer)
[![Coverage Status](https://coveralls.io/repos/github/oBusk/walkable-buffer/badge.svg?branch=master)](https://coveralls.io/github/oBusk/walkable-buffer?branch=master)

> 🚶🛡️ A class for easily reading data from binary Buffers

## Install

```bash
npm install walkable-buffer
```

## Usage

```js
import fs from 'fs';
import WalkableBuffer from 'walkable-buffer';

const buffer = fs.readFileSync('./temp');
const wb = new WalkableBuffer({
    buffer,
    // Set instance defaults
    endianness: 'LE',
    encoding: 'utf8',
    signed: true,
});

const v = wb.get(6, 'BE'); // 140 737 488 355 327
const s = wb.getString(16, 'utf16le'); // "Hellö höw åre yö"
const b = wb.getBigInt(null, false); // 18_446_744_073_709_551_615n
```

## API

The library is deployed with detailed `.d.ts` typings which should help in usage.

There are also generated API documentation. See

* [WalkableBuffer](https://github.com/oBusk/walkable-buffer/blob/master/api/classes/walkablebuffer.md)
* [WalkableBufferOptions](https://github.com/oBusk/walkable-buffer/blob/master/api/interfaces/walkablebufferoptions.md)

## License

MIT © Oscar Busk
