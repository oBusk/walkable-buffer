# Walkable Buffer

[![npm version](https://badgen.net/npm/v/walkable-buffer)](https://www.npmjs.com/package/walkable-buffer)
[![Node.js CI](https://github.com/oBusk/walkable-buffer/workflows/Node.js%20CI/badge.svg)](https://github.com/oBusk/walkable-buffer/actions)
[![codecov](https://codecov.io/gh/oBusk/walkable-buffer/branch/master/graph/badge.svg)](https://codecov.io/gh/oBusk/walkable-buffer)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=oBusk/walkable-buffer)](https://dependabot.com)
[![Bundlesize](https://img.shields.io/bundlephobia/minzip/walkable-buffer)](https://bundlephobia.com/result?p=walkable-buffer)
[![Bundle Watched](https://img.shields.io/badge/bundle-watched-blue.svg)](https://bundlewatch.io)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

> 🚶🛡️ A class for easily reading data from binary Buffers

## Install

```bash
npm install walkable-buffer
```

-   [Supported Node versions](./package.json#L21) aim to be
    [Latest current and LTS](https://nodejs.org/en/download/releases/) as well as trying to keep up to date
    with the latest supported node in
    [Google cloud functions](https://cloud.google.com/functions/docs/concepts/nodejs-10-runtime).

## Usage

-   [Instance defaults](#instance-defaults)
    -   [Defaults in Constructor](#defaults-in-constructor)
    -   [Set/get defaults on existing instance](#setget-defaults-on-existing-instance)
-   [Cursor](#cursor)
    -   [`initialCursor` in constructor](#initialcursor-in-constructor)
    -   [Manipulage Cursor](#manipulate-cursor)
-   [Read Integers](#read-integers)
-   [Read Strings](#read-strings)
-   [Buffer](#buffer)
-   [Size](#size)

```js
import fs from "fs";
import WalkableBuffer from "walkable-buffer";

const buffer = fs.readFileSync("./temp");
const wb = new WalkableBuffer({
    buffer,
    // Set instance defaults for `endianness`, `encoding` and `signed`
    // The instance default can be overridden for each operation
    endianness: "LE",
    encoding: "utf8",
    signed: true,
});

const v = wb.get(
    6 /* byteLength */,
    "BE" /* endianness - Override instance default for this operation */,
); // => 140 737 488 355 327
const s = wb.getString(
    16 /* byteLength */,
    "utf16le" /* encoding - overrides instance default */,
); // => "Hellö höw åre yö"
const b = wb.getBigInt(
    null /* endianness - null/undefined to use instance default */,
    false /* signed - override isntance default */,
); // 18_446_744_073_709_551_615n
```

### Instance defaults

The instance defaults include `endianness`, `encoding` and `signed` controlling how to read the binary
data into integers and text.

The effect of this is that the operations `get`/`peek` - `BigInt`/`String`/`SizedString` will use the
configured settings if none is provided.

|    Config    |      Default Value       |
| :----------: | :----------------------: |
| `endianness` |          `"LE"`          |
|  `encoding`  |         `"utf8"`         |
|   `signed`   | `true` (Signed integers) |

#### Defaults in Constructor

You can set the instance defaults when creating the instance by configuring it in the
[`WalkableBufferoptions`](src/WalkableBufferOptions.ts) provided to the constructor.

```js
import WalkableBuffer from "walkable-buffer";

const wb = new WalkableBuffer({
    buffer,
    endianness: "LE",
    encoding: "utf8",
    signed: true,
});
```

#### Set/get defaults on existing instance

You can also use `set`/`get` - `Endianness`/`Encoding`/`Signed`.

```js
import WalkableBuffer from "walkable-buffer";

const wb = new WalkableBuffer({ buffer });

wb.getEndianness(); // => "LE" (the default)
wb.setEndianness("BE");
wb.getEndianness(); // => "BE"

wb.getEncoding(); // "utf8" (the default)
wb.setEncoding("ascii");
wb.getEncoding(); // => "ascii"

wb.getSigned(); // true (for signed integers, the default)
wb.setSigned(false);
wb.getSigned(); // false (for unsigned integers)
```

### Cursor

The "cursor" is the byteOffset that the walkable buffer has currently "walked". It is the default
position to read data from, and it advances whenever a `get` operation is completed successfully.

By default, the WalkableBuffer will start with the cursor at `0`.

#### `initialCursor` in constructor

```js
import WalkableBuffer from "walkable-buffer";

const wb = new WalkableBuffer({
    buffer,
    initialCursor: false,
});
```

#### Manipulate Cursor

The following "walking" operations will advance the cursor to the first byte after the data read:

-   `get()`
-   `getBigInt()`
-   `getString()`
-   `getSizedString()`

The following operations will read the data _without_ manipulating the cursor:

-   `peek()`
-   `peekBigInt()`
-   `peekString()`
-   `peekSizedString()`

To manipulate the position of the cursor you can also

-   `skip(byteLength)` to skip `byteLength` of bytes.
-   `goTo(byteOffset)` to move cursor to a specific offset of the buffer.

And to get the current position of the cursor, use `getCurrentPos()`.

### Read Integers

-   `get(byteLength, endianness, signed)` - Read `byteLength` as a signed/unsigned integer,
    reading with `endianness`, and advancing cursor `byteLength`.
-   `peek(byteLength, byteOffset, endianness, signed)` - Read `byteLength` at cursor + `byteOffset` as a
    signed/unsigned integer, _without_ manipulating the cursor.
-   `getBigInt(endianness, signed)` - Read the next 8 bytes as a signed/unsigned
    [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
    , reading with `endianness`, and advancing cursor 8 steps.
-   `peekBigInt(byteOffset, endianness, signed)` - Read 8 bytes at `byteOffset` as a signed/unsigned
    [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
    , reading with `endianness`, _without_ manipulating the cursor.

### Read Strings

-   `getString(byteLength, encoding)` - Read the next `byteLength` bytes as a string, using `encoding`,
    and advances cursor `byteLength`.
-   `peekString(byteLength, byteOffset, encoding)` - Read the `byteLength` bytes at cursor
    -   `byteOffset`
        as a string, using `encoding`, _without_ manipulating the cursor.
-   `getSizedString(sizeOfSize, endianness, encoding)` - Read the next `sizeOfSize` as a
    integer with `endianness` to get byte-length, reads that many bytes as a string with `encoding`.

### Buffer

You can get the Buffer of WalkableBuffer back by running `getSourceBuffer()`.

You can also get Buffer of a specific `byteLength` from current cursor by running
`getBuffer(byteLength)`. If called without `byteLength`, returns a buffer being a split from
current cursor position to end of buffer.

### Size

You can get the size of the Buffer with `size()`, and get the number of bytes from current cursor
position to the end of the buffer, `sizeRemainingBuffer()`.

## License

MIT © Oscar Busk
