"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BYTE = 1;
const SHORT = 2;
const LONG = 4;
const LONGLONG = 8;
class WalkableBuffer {
    constructor(sourceBuffer, endianess, cursor = 0) {
        this.sourceBuffer = sourceBuffer;
        this.cursor = cursor;
        this.bufferSize = sourceBuffer.length;
        this.readInt = endianess === 'BE'
            ? (offset, byteLength, noAssert) => sourceBuffer.readIntBE(offset, byteLength, noAssert)
            : (offset, byteLength, noAssert) => sourceBuffer.readIntLE(offset, byteLength, noAssert);
    }
    get(size) {
        const result = this.readInt(this.cursor, size);
        this.cursor += size;
        return result;
    }
    peek(offset, size = BYTE) {
        return this.readInt(this.cursor + offset, size);
    }
    getString(size, encoding = 'utf8') {
        return this.sourceBuffer.toString(encoding, this.cursor, this.cursor += size);
    }
    peekString(offset, size, encoding = 'utf8') {
        return this.sourceBuffer.toString(encoding, this.cursor + offset, this.cursor + offset + size);
    }
    /** Reads a string with size-describer in front of it. Usually for names and such */
    getSizedString(
        /** The size of the lenght-describer. Usually is LONG which is default */
        sizeOfSize = LONG, encoding) {
        return this.getString(this.get(sizeOfSize), encoding);
    }
    /** Gets a buffer of size `size`. If no `size` is specified, returns remaining buffer. */
    getBuffer(size) {
        if (!!size && size > 0) {
            return this.sourceBuffer.slice(this.cursor, this.cursor += size);
        }
        else {
            const result = this.sourceBuffer.slice(this.cursor);
            this.cursor = this.sourceBuffer.length;
            return result;
        }
    }
    ignore(size) {
        return this.cursor += size;
    }
    getCurrentPos() {
        return this.cursor;
    }
    goTo(offset) {
        return this.cursor = offset;
    }
    /** Simply extracts the buffer which was provided on creation */
    getSourceBuffer() {
        return this.sourceBuffer;
    }
    size() {
        return this.bufferSize;
    }
    /** Returns the number of bytes that are left */
    sizeRemainingBuffer() {
        return this.bufferSize - this.cursor;
    }
}
exports.default = WalkableBuffer;
