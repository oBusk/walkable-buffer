# walkable-buffer

[![npm version](https://badgen.net/npm/v/walkable-buffer)](https://www.npmjs.com/package/walkable-buffer)
[![install size](https://badgen.net/packagephobia/publish/walkable-buffer)](https://packagephobia.now.sh/result?p=walkable-buffer)
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

const file = fs.readFileSync('./temp');
const wb = new WalkableBuffer(file);

const v = wb.get(8);
const s = wb.getString(16);
```

## API

See [`/api`](/api/classes/walkablebuffer.md)

## License

MIT © Oscar Busk
