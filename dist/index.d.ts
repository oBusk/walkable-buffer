/// <reference types="node" />
export default class WalkableBuffer {
    private sourceBuffer;
    private cursor;
    private readInt;
    private bufferSize;
    constructor(sourceBuffer: Buffer, endianess?: 'BE' | 'LE', cursor?: number);
    get(size: number): number;
    peek(offset: number, size?: number): number;
    getString(size: number, encoding?: string): string;
    peekString(offset: number, size: number, encoding?: string): string;
    /** Reads a string with size-describer in front of it. Usually for names and such */
    getSizedString(
        /** The size of the lenght-describer. Usually is LONG which is default */
        sizeOfSize?: number, encoding?: string): string;
    /** Gets a buffer of size `size`. If no `size` is specified, returns remaining buffer. */
    getBuffer(size?: number): Buffer;
    ignore(size: number): number;
    getCurrentPos(): number;
    goTo(offset: number): number;
    /** Simply extracts the buffer which was provided on creation */
    getSourceBuffer(): Buffer;
    size(): number;
    /** Returns the number of bytes that are left */
    sizeRemainingBuffer(): number;
}
