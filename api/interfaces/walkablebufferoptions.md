[walkable-buffer](../README.md) › [WalkableBufferOptions](walkablebufferoptions.md)

# Interface: WalkableBufferOptions

The options to provide into the constructor of `WalkableBuffer`.
Allows you to configure the _defaults_ for reading data from the buffer.

The class methods can override the settings for each call, but the deafult for the instance as a whole
can be useful since most data in buffers will be of same endianness or encoding.

## Hierarchy

* **WalkableBufferOptions**

## Index

### Properties

* [buffer](walkablebufferoptions.md#buffer)
* [encoding](walkablebufferoptions.md#optional-encoding)
* [endianness](walkablebufferoptions.md#optional-endianness)
* [initialCursor](walkablebufferoptions.md#optional-initialcursor)
* [signed](walkablebufferoptions.md#optional-signed)

## Properties

###  buffer

• **buffer**: *Buffer*

*Defined in [index.ts:30](https://github.com/oBusk/walkable-buffer/blob/b039c34/src/index.ts#L30)*

The `Buffer` to read and walk.

___

### `Optional` encoding

• **encoding**? : *[Encoding](../README.md#encoding)*

*Defined in [index.ts:49](https://github.com/oBusk/walkable-buffer/blob/b039c34/src/index.ts#L49)*

The encoding to read text with.
Valid text encodings are `ascii`, `utf8`, `utf16le`, `ucs2`(alias of `utf16le`), `base64`, `hex`.

_Defaults to `utf8`_

___

### `Optional` endianness

• **endianness**? : *[Endianness](../README.md#endianness)*

*Defined in [index.ts:42](https://github.com/oBusk/walkable-buffer/blob/b039c34/src/index.ts#L42)*

The endianness to read numbers with. `LE` little-endian or `BE` big-endian.

_Defaults to `LE`_

___

### `Optional` initialCursor

• **initialCursor**? : *undefined | number*

*Defined in [index.ts:36](https://github.com/oBusk/walkable-buffer/blob/b039c34/src/index.ts#L36)*

The starting position of the cursor.

_Defaults to `0`_

___

### `Optional` signed

• **signed**? : *undefined | false | true*

*Defined in [index.ts:55](https://github.com/oBusk/walkable-buffer/blob/b039c34/src/index.ts#L55)*

If number functions (`getBigInt()`) should default to read numbers as signed integers

_Defaults to `true` (signed integers)_
