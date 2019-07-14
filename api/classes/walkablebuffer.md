> **[walkable-buffer](../README.md)**

[WalkableBuffer](walkablebuffer.md) /

# Class: WalkableBuffer

> _🚶🛡️ A class for easily reading data from binary Buffers_

Create instance providing `WalkableBufferOptions`, with the `buffer` option as required.

## Hierarchy

* **WalkableBuffer**

### Index

#### Constructors

* [constructor](walkablebuffer.md#constructor)

#### Properties

* [options](walkablebuffer.md#options)

#### Methods

* [get](walkablebuffer.md#get)
* [getBigInt](walkablebuffer.md#getbigint)
* [getBuffer](walkablebuffer.md#getbuffer)
* [getCurrentPos](walkablebuffer.md#getcurrentpos)
* [getEncoding](walkablebuffer.md#getencoding)
* [getEndianness](walkablebuffer.md#getendianness)
* [getSigned](walkablebuffer.md#getsigned)
* [getSizedString](walkablebuffer.md#getsizedstring)
* [getSourceBuffer](walkablebuffer.md#getsourcebuffer)
* [getString](walkablebuffer.md#getstring)
* [goTo](walkablebuffer.md#goto)
* [peek](walkablebuffer.md#peek)
* [peekBigInt](walkablebuffer.md#peekbigint)
* [peekString](walkablebuffer.md#peekstring)
* [setEncoding](walkablebuffer.md#setencoding)
* [setEndianness](walkablebuffer.md#setendianness)
* [setSigned](walkablebuffer.md#setsigned)
* [size](walkablebuffer.md#size)
* [sizeRemainingBuffer](walkablebuffer.md#sizeremainingbuffer)
* [skip](walkablebuffer.md#skip)
* [isEndianness](walkablebuffer.md#static-isendianness)

## Constructors

###  constructor

\+ **new WalkableBuffer**(`options`: `Readonly<WalkableBufferOptions>`): *[WalkableBuffer](walkablebuffer.md)*

Defined in index.ts:73

**Parameters:**

Name | Type |
------ | ------ |
`options` | `Readonly<WalkableBufferOptions>` |

**Returns:** *[WalkableBuffer](walkablebuffer.md)*

## Properties

###  options

• **options**: *`Readonly<WalkableBufferOptions>`*

Defined in index.ts:75

## Methods

###  get

▸ **get**(`byteLength`: number, `endianness`: "BE" | "LE", `signed`: boolean): *number*

Defined in index.ts:98

Reads integer of `byteLength` bytes from current cursor position and advances cursor `byteLength` steps.

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`byteLength` | number | - |
`endianness` | "BE" \| "LE" |  this.getEndianness() |
`signed` | boolean |  this.getSigned() |

**Returns:** *number*

___

###  getBigInt

▸ **getBigInt**(`endianness`: "BE" | "LE", `signed`: boolean): *bigint*

Defined in index.ts:123

Reads the next 8 bytes as a `bigint`.

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`endianness` | "BE" \| "LE" |  this.getEndianness() |
`signed` | boolean |  this.getSigned() |

**Returns:** *bigint*

___

###  getBuffer

▸ **getBuffer**(`byteLength?`: undefined | number): *`Buffer`*

Defined in index.ts:321

Gets a `Buffer` of size `byteLength`. If no `size` is specified, returns remaining buffer.

**Parameters:**

Name | Type |
------ | ------ |
`byteLength?` | undefined \| number |

**Returns:** *`Buffer`*

___

###  getCurrentPos

▸ **getCurrentPos**(): *number*

Defined in index.ts:360

Returns current cursor position

**Returns:** *number*

___

###  getEncoding

▸ **getEncoding**(): *[Encoding](../README.md#encoding)*

Defined in index.ts:404

Gets the instance current default text encoding.

**Returns:** *[Encoding](../README.md#encoding)*

___

###  getEndianness

▸ **getEndianness**(): *[Endianness](../README.md#endianness)*

Defined in index.ts:379

Returns the instance default endianness

**Returns:** *[Endianness](../README.md#endianness)*

___

###  getSigned

▸ **getSigned**(): *boolean*

Defined in index.ts:431

Get the instance current `signed`. If numbers that are read should be signed rather than unsigned.

**Returns:** *boolean*

___

###  getSizedString

▸ **getSizedString**(`sizeOfSize`: number, `endianness`: "BE" | "LE", `encoding`: "ascii" | "utf8" | "utf16le" | "ucs2" | "base64" | "hex"): *string*

Defined in index.ts:284

Reads a string with size-describer in front of it. Usually for names and such.

This method is a shortcut for and works the same as:

    const length = wb.get(LONG);
    const string = wb.getString(length);

This method will also take the double bytelength into account for `utf16` and `ucs2`.

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`sizeOfSize` | number |  LONG |
`endianness` | "BE" \| "LE" |  this.getEndianness() |
`encoding` | "ascii" \| "utf8" \| "utf16le" \| "ucs2" \| "base64" \| "hex" |  this.getEncoding() |

**Returns:** *string*

___

###  getSourceBuffer

▸ **getSourceBuffer**(): *`Buffer`*

Defined in index.ts:455

**Returns:** *`Buffer`*

the buffer used internally _as is_.

Note that this will not be `===` the buffer provided on creation, as a copy is made on creation.

___

###  getString

▸ **getString**(`byteLength`: number, `encoding`: "ascii" | "utf8" | "utf16le" | "ucs2" | "base64" | "hex"): *string*

Defined in index.ts:201

Reads strings of `byteLength` bytes from current cursor position and advances cursor `byteLength` steps.

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`byteLength` | number | - |
`encoding` | "ascii" \| "utf8" \| "utf16le" \| "ucs2" \| "base64" \| "hex" |  this.getEncoding() |

**Returns:** *string*

___

###  goTo

▸ **goTo**(`byteOffset`: number): *number*

Defined in index.ts:365

Moves cursor to byte-position `byteOffset`

**Parameters:**

Name | Type |
------ | ------ |
`byteOffset` | number |

**Returns:** *number*

___

###  peek

▸ **peek**(`byteLength`: number, `byteOffset`: number, `endianness`: "BE" | "LE", `signed`: boolean): *number*

Defined in index.ts:146

Peeks integer of `byteLength` bytes from current cursor position plus `byteOffset`, without advancing cursor.

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`byteLength` | number | - |
`byteOffset` | number | 0 |
`endianness` | "BE" \| "LE" |  this.getEndianness() |
`signed` | boolean |  this.getSigned() |

**Returns:** *number*

___

###  peekBigInt

▸ **peekBigInt**(`byteOffset`: number, `endianness`: "BE" | "LE", `signed`: boolean): *bigint*

Defined in index.ts:176

Reads 8 bytes as a `bigint`. Reads forward from from current cursor position plus `byteOffset`.
Does not advance cursor.

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`byteOffset` | number | 0 |
`endianness` | "BE" \| "LE" |  this.getEndianness() |
`signed` | boolean |  this.getSigned() |

**Returns:** *bigint*

___

###  peekString

▸ **peekString**(`byteLength`: number, `byteOffset`: number, `encoding`: "ascii" | "utf8" | "utf16le" | "ucs2" | "base64" | "hex"): *string*

Defined in index.ts:228

Peek string of `byteLength` bytes from current cursor position plus `byteOffset` without advancing cursor.

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`byteLength` | number | - |
`byteOffset` | number | 0 |
`encoding` | "ascii" \| "utf8" \| "utf16le" \| "ucs2" \| "base64" \| "hex" |  this.getEncoding() |

**Returns:** *string*

___

###  setEncoding

▸ **setEncoding**(`encoding`: [Encoding](../README.md#encoding)): *[Encoding](../README.md#encoding)*

Defined in index.ts:415

Sets the instance default text encoding.

Valid text encodings are `ascii`, `utf8`, `utf16le`, `ucs2`(alias of `utf16le`), `base64`, `hex`.

**Parameters:**

Name | Type |
------ | ------ |
`encoding` | [Encoding](../README.md#encoding) |

**Returns:** *[Encoding](../README.md#encoding)*

The newly set `encoding`.

___

###  setEndianness

▸ **setEndianness**(`endianness`: [Endianness](../README.md#endianness)): *[Endianness](../README.md#endianness)*

Defined in index.ts:390

Sets the instances default endianness.

Either `BE` for big-endian or `LE` for little-endian.

**Parameters:**

Name | Type |
------ | ------ |
`endianness` | [Endianness](../README.md#endianness) |

**Returns:** *[Endianness](../README.md#endianness)*

The newly set `endianness`.

___

###  setSigned

▸ **setSigned**(`signed`: boolean): *boolean*

Defined in index.ts:440

Set the instance current `signed`. If numbers that are read should be signed rather than unsigned.

**Parameters:**

Name | Type |
------ | ------ |
`signed` | boolean |

**Returns:** *boolean*

The newly set `signed` boolean.

___

###  size

▸ **size**(): *number*

Defined in index.ts:460

**Returns:** *number*

the size in bytes of the full buffer.

___

###  sizeRemainingBuffer

▸ **sizeRemainingBuffer**(): *number*

Defined in index.ts:465

**Returns:** *number*

the number of bytes from current cursor to the end of the buffer.

___

###  skip

▸ **skip**(`byteLength`: number): *number*

Defined in index.ts:347

Advances cursor without reading any data.

**Parameters:**

Name | Type |
------ | ------ |
`byteLength` | number |

**Returns:** *number*

___

### `Static` isEndianness

▸ **isEndianness**(`check`: string): *boolean*

Defined in index.ts:65

Asserts that `check` is either string `LE` or string `BE`.

**Parameters:**

Name | Type |
------ | ------ |
`check` | string |

**Returns:** *boolean*