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
    private endianness: Endianness;
    private encoding: Encoding;

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

    /** Peeks integer of `byteLength` bytes from current cursor position plus `byteOffset`, without advancing cursor. */
    public peek(byteLength: number, byteOffset = 0, endianness = this.getEndianness()): number {
        return this.readInt(this.cursor + byteOffset, byteLength, endianness);
    }

    /** Reads strings of `byteLength` bytes from current cursor position and advances cursor `byteLength` steps. */
    public getString(byteLength: number, encoding = this.getEncoding()): string {
        const max = this.size() - this.cursor;

        if (byteLength < 1 || byteLength > max) {
            throw new Error(
                `The value of "byteLength" is out of range. It must be >= 1 and <= ${max}. Received ${byteLength}`,
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
        return this.sourceBuffer.toString(
            encoding,
            this.cursor + byteOffset,
            this.cursor + byteOffset + byteLength,
        );
    }

    /** Reads a string with size-describer in front of it. Usually for names and such */
    public getSizedString(sizeOfSize = LONG, encoding = this.getEncoding()): string {
        return this.getString(
            this.get(sizeOfSize),
            encoding,
        );
    }

    /** Gets a buffer of size `size`. If no `size` is specified, returns remaining buffer. */
    public getBuffer(size?: number): Buffer {
        if (!!size && size > 0) {
            return this.sourceBuffer.slice(
                this.cursor,
                this.cursor += size,
            );
        } else {
            const result = this.sourceBuffer.slice(
                this.cursor,
            );
            this.cursor = this.sourceBuffer.length;
            return result;
        }
    }

    /** Advances cursor without reading any data. */
    public skip(size: number): number {
        return this.cursor += size;
    }

    public getCurrentPos(): number {
        return this.cursor;
    }

    public goTo(offset: number): number {
        return this.cursor = offset;
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

    /** Wrapper for `Buffer.readIntLE()` and `Buffer.readIntBE()` that takes `endianness` into account. */
    private readInt(offset: number, byteLength: number, endianness: Endianness, noAssert?: boolean): number {
        if (endianness === 'BE') {
            return this.sourceBuffer.readIntBE(offset, byteLength, noAssert);
        } else if (endianness === 'LE') {
            return this.sourceBuffer.readIntLE(offset, byteLength, noAssert);
        } else {
            throw new Error(`Unknown endianness '${endianness}'`);
        }
    }
}
