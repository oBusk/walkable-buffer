import { Encoding } from "./Encoding.js";
import { Endianness } from "./Endianness.js";

/**
 * The options to provide into the constructor of `WalkableBuffer`.
 * Allows you to configure the _defaults_ for reading data from the buffer.
 *
 * The class methods can override the settings for each call, but the deafult for the instance as a whole
 * can be useful since most data in buffers will be of same endianness or encoding.
 */
export interface WalkableBufferOptions {
    /** The `Buffer` to read and walk. */
    buffer: Buffer;
    /**
     * The starting position of the cursor.
     *
     * _Defaults to `0`_
     */
    initialCursor?: number;
    /**
     * The endianness to read numbers with. `LE` little-endian or `BE` big-endian.
     *
     * _Defaults to `LE`_
     */
    endianness?: Endianness;
    /**
     * The encoding to read text with.
     * Valid text encodings are `ascii`, `utf8`, `utf16le`, `ucs2`(alias of `utf16le`), `base64`, `hex`.
     *
     * _Defaults to `utf8`_
     */
    encoding?: Encoding;
    /**
     * If number functions (`getBigInt()`) should default to read numbers as signed integers
     *
     * _Defaults to `true` (signed integers)_
     */
    signed?: boolean;
}
