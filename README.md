# Walkable Buffer

[![npm version](https://badgen.net/npm/v/walkable-buffer)](https://www.npmjs.com/package/walkable-buffer)
[![Node.js CI](https://github.com/oBusk/walkable-buffer/workflows/Node.js%20CI/badge.svg)](https://github.com/oBusk/walkable-buffer/actions)
[![codecov](https://codecov.io/gh/oBusk/walkable-buffer/branch/master/graph/badge.svg)](https://codecov.io/gh/oBusk/walkable-buffer)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=oBusk/walkable-buffer)](https://dependabot.com)
[![Bundlesize](https://img.shields.io/bundlephobia/minzip/walkable-buffer)](https://bundlephobia.com/result?p=walkable-buffer)
[![Bundle Watched](https://img.shields.io/badge/bundle-watched-blue.svg)](https://bundlewatch.io)

> 🚶🛡️ A class for easily reading data from binary Buffers

## Install

```bash
npm install walkable-buffer
```

-   If using Typescript, Typescript `>=3.8` is required.

-   [Supported Node versions](./package.json#L24-L26) aim to be
    [Latest current and LTS](https://nodejs.org/en/download/releases/) as well as trying to keep up to date
    with the latest supported node in
    [Google cloud functions](https://cloud.google.com/functions/docs/concepts/nodejs-10-runtime).

## Usage

```js
import fs from "fs";
import WalkableBuffer from "walkable-buffer";

const buffer = fs.readFileSync("./temp");
const wb = new WalkableBuffer({
    buffer,
    // Set instance defaults
    endianness: "LE",
    encoding: "utf8",
    signed: true
});

const v = wb.get(6, "BE"); // 140 737 488 355 327
const s = wb.getString(16, "utf16le"); // "Hellö höw åre yö"
const b = wb.getBigInt(null, false); // 18_446_744_073_709_551_615n
```

## API

The library is deployed with detailed `.d.ts` typings which should help in usage.

## License

MIT © Oscar Busk
