import { readBigInt64BE, readBigInt64LE, readBigUInt64BE, readBigUInt64LE } from 'read-bigint';
import { DEFAULT_ENCODING, DEFAULT_ENDIANNESS, DEFAULT_INITIAL_CURSOR, DEFAULT_SIGNED, LONG } from './constants';
import { Encoding, isEncoding } from './Encoding';
import { Endianness, isEndianness } from './Endianness';
import { WalkableBufferOptions } from './WalkableBufferOptions';

/**
 * > _🚶🛡️ A class for easily reading data from binary Buffers_
 *
 * Create instance providing `WalkableBufferOptions`, with the `buffer` option as required.
 */
export class WalkableBuffer {
    #cursor: number;
    readonly #buffer: Buffer;
    #endianness!: Endianness;
    #encoding!: Encoding;
    #signed!: boolean;

    constructor(readonly options: Readonly<WalkableBufferOptions>) {
        const buffer = options.buffer;
        const initialCursor = options.initialCursor ?? DEFAULT_INITIAL_CURSOR;
        const endianness = options.endianness ?? DEFAULT_ENDIANNESS;
        const encoding = options.encoding ?? DEFAULT_ENCODING;
        const signed = options.signed ?? DEFAULT_SIGNED;

        if (!buffer || !Buffer.isBuffer(buffer)) {
            throw new Error('No buffer in options!');
        }
        this.#buffer = Buffer.from(buffer); // Make sure to copy, not reference.

        if ((buffer.length - 1) < initialCursor || initialCursor < 0) {
            throw new Error(`Invalid initialCursor '${initialCursor}'`);
        }
        this.#cursor = initialCursor;

        this.setEndianness(endianness);
        this.setEncoding(encoding);
        this.setSigned(signed);
    }

    /** Reads integer of `byteLength` bytes from current cursor position and advances cursor `byteLength` steps. */
    get(
        /** The length in bytes to read */
        byteLength: number,
        /**
         * The endianness of the read action. `LE` for LittleEndian, `BE` for BigEndian.
         *
         * > _If not provided, will use the default that was provided when creating the instance._
         */
        endianness = this.getEndianness(),
        /**
         * If the integer should be parsed as signed or not.
         *
         * > _If not provided, will use the default that was provided when creating the instance._
         */
        signed = this.getSigned(),
    ): number {
        const result = this.readInt(this.#cursor, byteLength, endianness, signed);

        // Only do this if the read didn't throw
        this.#cursor += byteLength;

        return result;
    }

    /** Reads the next 8 bytes as a `bigint`. */
    getBigInt(
        /**
         * The endianness of the read action. `LE` for LittleEndian, `BE` for BigEndian.
         *
         * > _If not provided, will use the default that was provided when creating the instance._
         */
        endianness = this.getEndianness(),
        /**
         * If the integer should be parsed as signed or not.
         *
         * > _If not provided, will use the default that was provided when creating the instance._
         */
        signed = this.getSigned(),
    ): bigint {
        const result: bigint = this.readBigInt(this.#cursor, endianness, signed);

        // Only do this if the read didn't throw
        this.#cursor += 8;

        return result;
    }

    /** Peeks integer of `byteLength` bytes from current cursor position plus `byteOffset`, without advancing cursor. */
    peek(
        /** The length in bytes to read */
        byteLength: number,
        /**
         * The offset from the current `cursor` to start reading from. Both positive for later in buffer, or negative
         * for looking back.
         *
         * > _Defaults to `0`, so peeks from current `cursor`_
         */
        byteOffset = 0,
        /**
         * The endianness of the read action. `LE` for LittleEndian, `BE` for BigEndian.
         *
         * > _If not provided, will use the default that was provided when creating the instance._
         */
        endianness = this.getEndianness(),
        /**
         * If the integer should be parsed as signed or not.
         *
         * > _If not provided, will use the default that was provided when creating the instance._
         */
        signed = this.getSigned(),
    ): number {
        return this.readInt(this.#cursor + byteOffset, byteLength, endianness, signed);
    }

    /**
     * Reads 8 bytes as a `bigint`. Reads forward from from current cursor position plus `byteOffset`.
     * Does not advance cursor.
     */
    peekBigInt(
        /**
         * The offset from the current `cursor` to start reading from. Both positive for later in buffer, or negative
         * for looking back.
         *
         * > _Defaults to `0`, so peeks from current `cursor`_
         */
        byteOffset = 0,
        /**
         * The endianness of the read action. `LE` for LittleEndian, `BE` for BigEndian.
         *
         * > _If not provided, will use the default that was provided when creating the instance._
         */
        endianness = this.getEndianness(),
        /**
         * If the integer should be parsed as signed or not.
         *
         * > _If not provided, will use the default that was provided when creating the instance._
         */
        signed = this.getSigned(),
    ): bigint {
        return this.readBigInt(this.#cursor + byteOffset, endianness, signed);
    }

    /** Reads strings of `byteLength` bytes from current cursor position and advances cursor `byteLength` steps. */
    getString(
        /** The length in bytes to read */
        byteLength: number,
        /**
         * The encoding to read strings with.
         * Valid string encodings are `ascii`, `utf8`, `utf16le`, `ucs2`(alias of `utf16le`), `base64`, `hex`.
         *
         * > _If not provided, will use the default that was provided when creating the instance._
         */
        encoding = this.getEncoding(),
    ): string {
        const max = this.size() - this.#cursor;

        if (byteLength < 0 || byteLength > max) {
            throw new Error(
                `The value of "byteLength" is out of range. It must be >= 0 and <= ${max}. Received ${byteLength}`,
            );
        }

        return this.#buffer.toString(
            encoding,
            this.#cursor,
            this.#cursor += byteLength,
        );
    }

    /** Peek string of `byteLength` bytes from current cursor position plus `byteOffset` without advancing cursor. */
    peekString(
        /** The length in bytes to read */
        byteLength: number,
        /**
         * The offset from the current `cursor` to start reading from. Both positive for later in buffer, or negative
         * for looking back.
         *
         * > _Defaults to `0`, so peeks from current `cursor`_
         */
        byteOffset = 0,
        /**
         * The encoding to read strings with.
         * Valid string encodings are `ascii`, `utf8`, `utf16le`, `ucs2`(alias of `utf16le`), `base64`, `hex`.
         *
         * > _If not provided, will use the default that was provided when creating the instance._
         */
        encoding = this.getEncoding(),
    ): string {
        const size = this.size();
        const cursor = this.getCurrentPos();
        const minByteOffset = -cursor;
        const maxByteOffset = size - cursor - 1; // Since size has to be greater than zero

        if (byteOffset < minByteOffset || byteOffset > maxByteOffset) {
            throw new Error(
                `The value of "byteOffset" is out of range.`
                + ` It must be >= ${minByteOffset} and <= ${maxByteOffset}. Recieved ${byteOffset}`,
            );
        }

        const startPos = cursor + byteOffset;
        const max = size - startPos;

        if (byteLength < 0 || byteLength > max) {
            throw new Error(
                `The value of "byteLength" is out of range. It must be >= 0 and <= ${max}. Received ${byteLength}`,
            );
        }

        return this.#buffer.toString(
            encoding,
            startPos,
            startPos + byteLength,
        );
    }

    /**
     * Reads a string with size-describer in front of it. Usually for names and such.
     *
     * This method is a shortcut for and works the same as:
     *
     *     const length = wb.get(LONG);
     *     const string = wb.getString(length);
     *
     * This method will also take the double bytelength into account for `utf16` and `ucs2`.
     */
    getSizedString(
        /**
         * The length in bytes of the integer to use as length for the string.
         *
         * > _If not provided, defaults to LONG (4 bytes)._
         */
        sizeOfSize = LONG,
        /**
         * The endianness of the integer to use as length for the string.
         *
         * > _If not provided, will use the default that was provided when creating the instance._
         */
        endianness = this.getEndianness(),
        /**
         * The text encoding of the string that is read.
         *
         * Valid string encodings are `ascii`, `utf8`, `utf16le`, `ucs2`(alias of `utf16le`), `base64`, `hex`.
         *
         * If encoding is `utf16le` (or alias `ucs2`) the length of the read will be double the integer.
         *
         * > _If not provided, will use the default that was provided when creating the instance._
         */
        encoding = this.getEncoding(),
    ): string {
        let size = this.get(sizeOfSize, endianness);

        if (encoding === 'utf16le' || encoding === 'ucs2') {
            size = size * 2;
        }

        try {
            return this.getString(size, encoding);
        } catch (e) {
            this.#cursor -= sizeOfSize;
            throw e;
        }
    }

    /** Gets a `Buffer` of size `byteLength`. If no `size` is specified, returns remaining buffer. */
    getBuffer(
        /**
         * The length of the `Buffer` to extract. If omitted, returns `Buffer` between current cursor and end of buffer.
         *
         * Has to be `1>=` and not exceed the buffer.
         */
        byteLength?: number,
    ): Buffer {
        if (byteLength == null) {
            const result = this.#buffer.slice(this.#cursor);
            this.#cursor = this.#buffer.length;
            return result;
        } else {
            const max = this.size() - this.getCurrentPos();

            if (byteLength < 1 || byteLength > max) {
                throw new Error(
                    `The value of "byteLength" is out of range. It must be >= 1 and <= ${max}. Received ${byteLength}`,
                );
            }

            return this.#buffer.slice(this.#cursor, this.#cursor += byteLength);
        }
    }

    /** Advances cursor without reading any data. */
    skip(byteLength: number): number {
        const max = this.size() - this.getCurrentPos();

        if (byteLength < 1 || byteLength > max) {
            throw new Error(
                `The value of "byteLength" is out of range. It must be >= 1 and <= ${max}. Received ${byteLength}`,
            );
        }

        return this.#cursor += byteLength;
    }

    /** Returns current cursor position */
    getCurrentPos(): number {
        return this.#cursor;
    }

    /** Moves cursor to byte-position `byteOffset` */
    goTo(byteOffset: number): number {
        const max = this.size() - 1;

        if (byteOffset < 0 || byteOffset > max) {
            throw new Error(
                `The value of "byteOffset" is out of range. `
                + `It must be >= 0 and <= ${max}. Received ${byteOffset}`,
            );
        }

        return this.#cursor = byteOffset;
    }

    /** Returns the instance default endianness */
    getEndianness(): Endianness {
        return this.#endianness;
    }

    /**
     * Sets the instances default endianness.
     *
     * Either `BE` for big-endian or `LE` for little-endian.
     *
     * @returns The newly set `endianness`.
     */
    setEndianness(
        /** Either `BE` for big-endian or `LE` for little-endian. */
        endianness: Endianness,
    ): Endianness {
        if (isEndianness(endianness)) {
            this.#endianness = endianness;
        } else {
            throw new Error(`Invalid endianness '${endianness}'`);
        }

        return this.getEndianness();
    }

    /** Gets the instance current default text encoding. */
    getEncoding(): Encoding {
        return this.#encoding;
    }

    /**
     * Sets the instance default text encoding.
     *
     * Valid text encodings are `ascii`, `utf8`, `utf16le`, `ucs2`(alias of `utf16le`), `base64`, `hex`.
     *
     * @returns The newly set `encoding`.
     */
    setEncoding(
        /**
         * Valid text encodings are `ascii`, `utf8`, `utf16le`, `ucs2`(alias of `utf16le`), `base64`, `hex`.
         */
        encoding: Encoding,
    ): Encoding {
        if (isEncoding(encoding)) {
            this.#encoding = encoding;
        } else {
            throw new Error(`Invalid encoding '${encoding}'`);
        }

        return this.getEncoding();
    }

    /** Get the instance current `signed`. If numbers that are read should be signed rather than unsigned. */
    getSigned(): boolean {
        return this.#signed;
    }

    /**
     * Set the instance current `signed`. If numbers that are read should be signed rather than unsigned.
     *
     * @returns The newly set `signed` boolean.
     */
    setSigned(signed: boolean): boolean {
        if (typeof signed === 'boolean') {
            this.#signed = signed;
        } else {
            throw new Error(`Invalid value for signed '${signed}'`);
        }

        return this.getSigned();
    }

    /**
     * @returns the buffer used internally _as is_.
     *
     * Note that this will not be `===` the buffer provided on creation, as a copy is made on creation.
     */
    getSourceBuffer(): Buffer {
        return this.#buffer;
    }

    /** @returns the size in bytes of the full buffer. */
    size(): number {
        return this.#buffer.length;
    }

    /** @returns the number of bytes from current cursor to the end of the buffer.  */
    sizeRemainingBuffer(): number {
        return this.size() - this.#cursor;
    }

    /** Wrapper for `Buffer.readIntLE()` and `Buffer.readIntBE()` that takes `endianness` and `signed` into account. */
    private readInt(offset: number, byteLength: number, endianness: Endianness, signed: boolean): number {
        if (endianness === 'BE') {
            if (signed) {
                return this.#buffer.readIntBE(offset, byteLength);
            } else {
                return this.#buffer.readUIntBE(offset, byteLength);
            }
        } else if (endianness === 'LE') {
            if (signed) {
                return this.#buffer.readIntLE(offset, byteLength);
            } else {
                return this.#buffer.readUIntLE(offset, byteLength);
            }
        } else {
            throw new Error(`Invalid endianness '${endianness}'`);
        }
    }

    /** Wrapper to read `bigint` from `this.buffer` */
    private readBigInt(offset: number, endianness: string, signed: boolean) {
        let result: bigint;
        if (endianness === 'LE') {
            if (signed) {
                result = readBigInt64LE(this.#buffer, offset);
            } else {
                result = readBigUInt64LE(this.#buffer, offset);
            }
        } else if (endianness === 'BE') {
            if (signed) {
                result = readBigInt64BE(this.#buffer, offset);
            } else {
                result = readBigUInt64BE(this.#buffer, offset);
            }
        } else {
            throw new Error(`Invalid endianness '${endianness}'`);
        }
        return result;
    }
}
