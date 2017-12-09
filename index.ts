const BYTE = 1;
const SHORT = 2;
const LONG = 4;
const LONGLONG = 8;

export default class WalkableBuffer {

    private readInt: (offset: number, byteLength: number, noAssert?: boolean) => number;
    private bufferSize: number;

    constructor(private sourceBuffer: Buffer, endianess?: 'BE' | 'LE', private cursor = 0) {
        this.bufferSize = sourceBuffer.length;

        this.readInt = endianess === 'BE'
            ? (offset, byteLength, noAssert) => sourceBuffer.readIntBE(offset, byteLength, noAssert)
            : (offset, byteLength, noAssert) => sourceBuffer.readIntLE(offset, byteLength, noAssert);
    }

    public get(size: number): number {
        const result = this.readInt(this.cursor, size);
        this.cursor += size;
        return result;
    }

    public peek(offset: number, size: number = BYTE): number {
        return this.readInt(this.cursor + offset, size);
    }

    public getString(size: number, encoding = 'utf8'): string {
        return this.sourceBuffer.toString(
            encoding,
            this.cursor,
            this.cursor += size,
        );
    }

    public peekString(offset: number, size: number, encoding = 'utf8'): string {
        return this.sourceBuffer.toString(
            encoding,
            this.cursor + offset,
            this.cursor + offset + size,
        );
    }

    /** Reads a string with size-describer in front of it. Usually for names and such */
    public getSizedString(
        /** The size of the lenght-describer. Usually is LONG which is default */
        sizeOfSize = LONG,
        encoding?: string,
    ): string {
        return this.getString(
            this.get(sizeOfSize),
            encoding,
        );
    }

    /** Gets a buffer of size `size`. If no `size` is specified, returns remaining buffer. */
    public getBuffer(
        size?: number,
    ): Buffer {
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

    public ignore(size: number): number {
        return this.cursor += size;
    }

    public getCurrentPos(): number {
        return this.cursor;
    }

    public goTo(offset: number): number {
        return this.cursor = offset;
    }

    /** Simply extracts the buffer which was provided on creation */
    public getSourceBuffer(): Buffer {
        return this.sourceBuffer;
    }

    public size(): number {
        return this.bufferSize;
    }

    /** Returns the number of bytes that are left */
    public sizeRemainingBuffer(): number {
        return this.bufferSize - this.cursor;
    }
}
