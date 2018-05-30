import WalkableBuffer, { BYTE, LONG, LONGLONG, SHORT } from '../index';

describe('constructor', () => {
    describe('parameters', () => {
        let buffer: Buffer;

        beforeEach(() => {
            buffer = Buffer.alloc(LONGLONG);
        });

        test('basic case', () => {
            const walkableBuffer = new WalkableBuffer(buffer);
            expect(walkableBuffer.getSourceBuffer().toString()).toBe(buffer.toString());
        });

        test('providing endianness', () => {
            const def = new WalkableBuffer(buffer);
            expect(def.getEndianness()).toBe('LE');

            const be = new WalkableBuffer(buffer, 'BE');
            expect(be.getEndianness()).toBe('BE');

            const le = new WalkableBuffer(buffer, 'LE');
            expect(le.getEndianness()).toBe('LE');
        });

        test('providing invalid endianness', () => {
            expect(() => new WalkableBuffer(buffer, 'QQ' as any)).toThrowError(/Invalid endianness/);
        });

        test('providing encoding', () => {
            const def = new WalkableBuffer(buffer);
            expect(def.getEncoding()).toBe('utf8');

            const ascii = new WalkableBuffer(buffer, undefined, 'ascii');
            expect(ascii.getEncoding()).toBe('ascii');

            const hex = new WalkableBuffer(buffer, undefined, 'hex');
            expect(hex.getEncoding()).toBe('hex');
        });

        test('providing invalid encoding', () => {
            expect(() => new WalkableBuffer(buffer, undefined, 'STEVEN' as any)).toThrowError(/Invalid encoding/);
        });

        test('providing cursor', () => {
            const def = new WalkableBuffer(buffer);
            expect(def.getCurrentPos()).toBe(0);

            const five = new WalkableBuffer(buffer, undefined, undefined, 5);
            expect(five.getCurrentPos()).toBe(5);
        });

        test('providing invalid cursor', () => {
            expect(() => new WalkableBuffer(buffer, undefined, undefined, LONGLONG - 1)).not.toThrow();
            expect(() => new WalkableBuffer(buffer, undefined, undefined, LONGLONG)).toThrowError(/Invalid cursor/);
        });
    });

    describe('buffer copying', () => {
        test('changes to original array not reflected in walkable buffer', () => {
            const buffer = Buffer.from('ABCD');

            const wBuf = new WalkableBuffer(buffer);

            buffer.write('XXXX', 0, 8);

            expect(buffer.toString()).toBe('XXXX');
            expect(wBuf.getString(4)).toBe('ABCD');
            expect(wBuf.getSourceBuffer().toString()).toBe('ABCD');
        });
    });
});

describe('integer functions', () => {
    let buffer: Buffer;
    let walkableBuffer: WalkableBuffer;

    beforeEach(() => {
        buffer = Buffer.from([0x00, 0xFF]);
        walkableBuffer = new WalkableBuffer(buffer);
    });

    describe('get', () => {
        test('reads specified amount of bytes', () => {
            expect(walkableBuffer.get(BYTE)).toBe(0);
            expect(walkableBuffer.get(BYTE)).toBe(-1);
        });

        describe('positioning', () => {
            test('advances position', () => {
                expect(walkableBuffer.get(BYTE)).toBe(0);
                expect(walkableBuffer.getCurrentPos()).toBe(1);
            });

            test('throws when using negative size', () => {
                expect(() => walkableBuffer.get(-BYTE)).toThrow();
            });

            test('throws if trying to get more than left', () => {
                expect(() => walkableBuffer.get(3)).toThrow();
            });

            test('throws if trying to get more than left', () => {
                expect(() => walkableBuffer.get(1)).not.toThrow();
                expect(() => walkableBuffer.get(1)).not.toThrow();
                expect(() => walkableBuffer.get(1)).toThrow();
                expect(walkableBuffer.getCurrentPos()).toBe(2);
                expect(() => walkableBuffer.get(1)).toThrow();
                expect(walkableBuffer.getCurrentPos()).toBe(2);
            });

            test('does not advance position when failing', () => {
                expect(walkableBuffer.get(SHORT)).toBe(-256);
                expect(walkableBuffer.getCurrentPos()).toBe(2);
                expect(() => walkableBuffer.get(BYTE)).toThrow();
                expect(walkableBuffer.getCurrentPos()).toBe(2);
            });

            test('does not advance position when failing', () => {
                expect(() => walkableBuffer.get(3)).toThrow();
                expect(walkableBuffer.getCurrentPos()).toBe(0);
            });
        });

        describe('endianness', () => {
            test('reads default (LE)', () => {
                expect(walkableBuffer.get(SHORT)).toBe(-256);
            });

            test('reads LE', () => {
                expect(walkableBuffer.get(SHORT, 'LE')).toBe(-256);
            });

            test('reads BE', () => {
                expect(walkableBuffer.get(SHORT, 'BE')).toBe(255);
            });
        });
    });

    describe('peek', () => {
        test('reads specified amount of bytes', () => {
            expect(walkableBuffer.peek(BYTE)).toBe(0);
        });

        describe('positioning', () => {
            test('does not advance position', () => {
                expect(walkableBuffer.peek(BYTE)).toBe(0);
                expect(walkableBuffer.getCurrentPos()).toBe(0);
                expect(walkableBuffer.peek(BYTE)).toBe(0);
            });

            test('throws when using negative size', () => {
                expect(() => walkableBuffer.peek(-BYTE)).toThrow();
            });

            test('handles byteOffset', () => {
                expect(walkableBuffer.peek(BYTE, BYTE)).toBe(-1);
            });

            test('handles negative byteOffset', () => {
                walkableBuffer = new WalkableBuffer(buffer, undefined, undefined, 1);

                expect(walkableBuffer.peek(BYTE)).toBe(-1);
                expect(walkableBuffer.peek(BYTE, -BYTE)).toBe(0);
            });

            test('throws when trying to peek outside buffer', () => {
                expect(() => walkableBuffer.peek(LONG)).toThrow();
                expect(() => walkableBuffer.peek(BYTE, 2)).toThrow();
                expect(() => walkableBuffer.peek(BYTE, -1)).toThrow();
            });
        });

        describe('endianness', () => {
            test('reads default (LE)', () => {
                expect(walkableBuffer.peek(SHORT)).toBe(-256);
            });

            test('reads LE', () => {
                expect(walkableBuffer.peek(SHORT, undefined, 'LE')).toBe(-256);
            });

            test('reads BE', () => {
                expect(walkableBuffer.peek(SHORT, undefined, 'BE')).toBe(255);
            });
        });
    });
});

describe('string functions', () => {
    let u16buffer: Buffer;
    let u16walkableBuffer: WalkableBuffer;

    beforeEach(() => {
        u16buffer = Buffer.from([
            0x48, 0x00, 0x65, 0x00, 0x6C, 0x00, 0x6C, 0x00, 0xF6, 0x00, 0x20,
            0x00, 0x57, 0x00, 0x6F, 0x00, 0x72, 0x00, 0x6C, 0x00, 0xB4, 0x03,
        ]); // Hellö Worlδ in uni16le
        u16walkableBuffer = new WalkableBuffer(u16buffer, undefined, 'utf16le');
    });

    describe('getString', () => {
        test('reads string of size', () => {
            expect(u16walkableBuffer.getString(0xB * 2)).toBe('Hellö Worlδ');
        });

        describe('encoding', () => {
            test('read string as utf-8', () => {
                const u8Buffer = Buffer.from(
                    [0x48, 0x65, 0x6C, 0x6C, 0xC3, 0xB6, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0xCE, 0xB4],
                ); // Hellö Worlδ in Unicode
                const u8WalkableBuffer = new WalkableBuffer(u8Buffer, undefined, 'utf8');

                expect(u8WalkableBuffer.getString(0xD)).toBe('Hellö Worlδ');
            });

            test('read string as ascii', () => {
                const asciiBuffer = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F]); // Hello in ascii
                const asciiWalkableBuffer = new WalkableBuffer(asciiBuffer, undefined, 'ascii');

                expect(asciiWalkableBuffer.getString(0x5)).toBe('Hello');
            });
        });

        describe('position and size', () => {
            test('advances position when reading', () => {
                expect(u16walkableBuffer.getString(0x5 * 2)).toBe('Hellö');
                expect(u16walkableBuffer.getCurrentPos()).toBe(10);
            });

            test('fails when using negative size, without changing cursor', () => {
                expect(() => u16walkableBuffer.getString(-1)).toThrow();
            });

            test('fails when reading outside buffer, without advancing cursor', () => {
                expect(() => u16walkableBuffer.getString((0xB * 2) + 1)).toThrow();
                expect(u16walkableBuffer.getCurrentPos()).toBe(0);
            });
        });
    });
});
