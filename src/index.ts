export const OCTET = 1;
export const BYTE = OCTET;
export const SHORT = 2;
export const LONG = 4;
export const LONGLONG = 8;

/**
 * The endianness to read integers with.
 *
 * * `LE` - for little-endian
 * * `BE` - for big-endian
 */
export type Endianness = 'BE' | 'LE';

export type Encoding = 'ascii' | 'utf8' | 'utf16le' | 'ucs2' | 'base64' | 'hex';

export default class WalkableBuffer {
    public static isEndianness(endianness: any): endianness is Endianness {
        return typeof endianness === 'string' && (endianness === 'LE' || endianness === 'BE');
    }

    private sourceBuffer: Buffer;
    private endianness!: Endianness;
    private encoding!: Encoding;

    /**
     * @param sourceBuffer The `Buffer` to read and walk.
     * @param endianness The endianness to read integers with. `LE` little-endian or `BE` big-endian.
     * @param encoding The encoding to read strings with.
     * Valid string encodings are `ascii`, `utf8`, `utf16le`, `ucs2`(alias of `utf16le`), `base64`, `hex`.
     * @param cursor The starting position of the cursor. _Defaults to `0`_
     */
    constructor(sourceBuffer: Buffer, endianness: Endianness = 'LE', encoding: Encoding = 'utf8', private cursor = 0) {
        if (this.cursor > (sourceBuffer.length - 1)) {
            throw new Error(`Invalid cursor '${this.cursor}'`);
        }

        this.sourceBuffer = Buffer.from(sourceBuffer);

        this.setEndianness(endianness);
        this.setEncoding(encoding);
    }

    /** Reads integer of `byteLength` bytes from current cursor position and advances cursor `byteLength` steps. */
    public get(byteLength: number, endianness = this.getEndianness()): number {
        const result = this.readInt(this.cursor, byteLength, endianness);
        this.cursor += byteLength;
        return result;
    }

    /** Reads the next 8 bytes as a 64bit number. */
    public get64(endianness = this.getEndianness(), unsigned = false): bigint {
        const first = this.sourceBuffer[this.cursor];
        const last = this.sourceBuffer[this.cursor + 7];
        if (first === undefined || last === undefined) {
            throw new Error('Out of bounds');
        }

        let result: bigint;
        if (endianness === 'LE') {
            if (unsigned) {
                result = this.readBigUInt64LE(this.cursor, first, last);
            } else {
                result = this.readBigInt64LE(this.cursor, first, last);
            }
        } else if (endianness === 'BE') {
            if (unsigned) {
                result = this.readBigUInt64BE(this.cursor, first, last);
            } else {
                result = this.readBigInt64BE(this.cursor, first, last);
            }
        } else {
            throw new Error(`Invalid endianness '${endianness}'`);
        }
        // Only do this if the read didn't throw
        this.cursor += 8;
        return result;
    }

    /** Peeks integer of `byteLength` bytes from current cursor position plus `byteOffset`, without advancing cursor. */
    public peek(byteLength: number, byteOffset = 0, endianness = this.getEndianness()): number {
        return this.readInt(this.cursor + byteOffset, byteLength, endianness);
    }

    /** Reads strings of `byteLength` bytes from current cursor position and advances cursor `byteLength` steps. */
    public getString(byteLength: number, encoding = this.getEncoding()): string {
        const max = this.size() - this.cursor;

        if (byteLength < 0 || byteLength > max) {
            throw new Error(
                `The value of "byteLength" is out of range. It must be >= 0 and <= ${max}. Received ${byteLength}`,
            );
        }

        return this.sourceBuffer.toString(
            encoding,
            this.cursor,
            this.cursor += byteLength,
        );
    }

    /** Peek string of `byteLength` bytes from current cursor position plus `byteOffset` without advancing cursor. */
    public peekString(byteLength: number, byteOffset = 0, encoding = this.getEncoding()): string {
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

        return this.sourceBuffer.toString(
            encoding,
            startPos,
            startPos + byteLength,
        );
    }

    /** Reads a string with size-describer in front of it. Usually for names and such */
    public getSizedString(sizeOfSize = LONG, endianness = this.getEndianness(), encoding = this.getEncoding()): string {
        let size = this.get(sizeOfSize, endianness);

        if (encoding === 'utf16le' || encoding === 'ucs2') {
            size = size * 2;
        }

        try {
            return this.getString(size, encoding);
        } catch (e) {
            this.cursor -= sizeOfSize;
            throw e;
        }
    }

    /** Gets a buffer of size `size`. If no `size` is specified, returns remaining buffer. */
    public getBuffer(byteLength?: number): Buffer {
        if (byteLength == null) {
            const result = this.sourceBuffer.slice(this.cursor);
            this.cursor = this.sourceBuffer.length;
            return result;
        } else {
            const max = this.size() - this.getCurrentPos();

            if (byteLength < 1 || byteLength > max) {
                throw new Error(
                    `The value of "byteLength" is out of range. It must be >= 1 and <= ${max}. Received ${byteLength}`,
                );
            }

            return this.sourceBuffer.slice(this.cursor, this.cursor += byteLength);
        }
    }

    /** Advances cursor without reading any data. */
    public skip(byteLength: number): number {
        const max = this.size() - this.getCurrentPos();

        if (byteLength < 1 || byteLength > max) {
            throw new Error(
                `The value of "byteLength" is out of range. It must be >= 1 and <= ${max}. Received ${byteLength}`,
            );
        }

        return this.cursor += byteLength;
    }

    public getCurrentPos(): number {
        return this.cursor;
    }

    public goTo(byteOffset: number): number {
        const max = this.size() - 1;

        if (byteOffset < 0 || byteOffset > max) {
            throw new Error(
                `The value of "byteLength" is out of range. `
                + `It must be >= 0 and <= ${max}. Received ${byteOffset}`,
            );
        }

        return this.cursor = byteOffset;
    }

    public getEndianness(): Endianness {
        return this.endianness;
    }

    public setEndianness(endianness: Endianness): Endianness {
        if (WalkableBuffer.isEndianness(endianness)) {
            this.endianness = endianness;
        } else {
            throw new Error(`Invalid endianness '${endianness}'`);
        }

        return this.getEndianness();
    }

    public getEncoding(): Encoding {
        return this.encoding;
    }

    public setEncoding(encoding: Encoding): Encoding {
        if (Buffer.isEncoding(encoding)) {
            this.encoding = encoding;
        } else {
            throw new Error(`Invalid encoding '${encoding}'`);
        }

        return this.getEncoding();
    }

    public getSourceBuffer(): Buffer {
        return this.sourceBuffer;
    }

    public size(): number {
        return this.sourceBuffer.length;
    }

    public sizeRemainingBuffer(): number {
        return this.size() - this.cursor;
    }

    /** Wrapper for `Buffer.readIntLE()` and `Buffer.readIntBE()` that takes `endianness` into account. */
    private readInt(offset: number, byteLength: number, endianness: Endianness, noAssert?: boolean): number {
        if (endianness === 'BE') {
            return this.sourceBuffer.readIntBE(offset, byteLength, noAssert);
        } else if (endianness === 'LE') {
            return this.sourceBuffer.readIntLE(offset, byteLength, noAssert);
        } else {
            throw new Error(`Invalid endianness '${endianness}'`);
        }
    }

    // based on https://github.com/nodejs/node/blob/v12.6.0/lib/internal/buffer.js#L78-L96
    private readBigUInt64LE(offset: number, first: number, last: number) {
        const lo = first +
            this.sourceBuffer[++offset] * 2 ** 8 +
            this.sourceBuffer[++offset] * 2 ** 16 +
            this.sourceBuffer[++offset] * 2 ** 24;

        const hi = this.sourceBuffer[++offset] +
            this.sourceBuffer[++offset] * 2 ** 8 +
            this.sourceBuffer[++offset] * 2 ** 16 +
            last * 2 ** 24;

        return BigInt(lo) + (BigInt(hi) << BigInt(32));
    }

    // based on https://github.com/nodejs/node/blob/v12.6.0/lib/internal/buffer.js#L98-L116
    private readBigUInt64BE(offset: number, first: number, last: number) {
        const hi = first * 2 ** 24 +
            this.sourceBuffer[++offset] * 2 ** 16 +
            this.sourceBuffer[++offset] * 2 ** 8 +
            this.sourceBuffer[++offset];

        const lo = this.sourceBuffer[++offset] * 2 ** 24 +
            this.sourceBuffer[++offset] * 2 ** 16 +
            this.sourceBuffer[++offset] * 2 ** 8 +
            last;

        return (BigInt(hi) << BigInt(32)) + BigInt(lo);
    }

    // based on https://github.com/nodejs/node/blob/v12.6.0/lib/internal/buffer.js#L118-L134
    private readBigInt64LE(offset: number, first: number, last: number) {
        const val = this.sourceBuffer[offset + 4] +
            this.sourceBuffer[offset + 5] * 2 ** 8 +
            this.sourceBuffer[offset + 6] * 2 ** 16 +
            (last << 24); // Overflow
        return (BigInt(val) << BigInt(32)) +
            BigInt(first +
                this.sourceBuffer[++offset] * 2 ** 8 +
                this.sourceBuffer[++offset] * 2 ** 16 +
                this.sourceBuffer[++offset] * 2 ** 24);
    }

    // based on https://github.com/nodejs/node/blob/v12.6.0/lib/internal/buffer.js#L136-L152
    private readBigInt64BE(offset: number, first: number, last: number) {
        const val = (first << 24) + // Overflow
            this.sourceBuffer[++offset] * 2 ** 16 +
            this.sourceBuffer[++offset] * 2 ** 8 +
            this.sourceBuffer[++offset];
        return (BigInt(val) << BigInt(32)) +
            BigInt(this.sourceBuffer[++offset] * 2 ** 24 +
                this.sourceBuffer[++offset] * 2 ** 16 +
                this.sourceBuffer[++offset] * 2 ** 8 +
                last);
    }
}
