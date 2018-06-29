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
            expect(() => new WalkableBuffer(buffer, 'QQ' as any)).toThrow(/Invalid endianness/);
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
            expect(() => new WalkableBuffer(buffer, undefined, 'STEVEN' as any)).toThrow(/Invalid encoding/);
        });

        test('providing cursor', () => {
            const def = new WalkableBuffer(buffer);
            expect(def.getCurrentPos()).toBe(0);

            const five = new WalkableBuffer(buffer, undefined, undefined, 5);
            expect(five.getCurrentPos()).toBe(5);
        });

        test('providing invalid cursor', () => {
            expect(() => new WalkableBuffer(buffer, undefined, undefined, LONGLONG - 1)).not.toThrow();
            expect(() => new WalkableBuffer(buffer, undefined, undefined, LONGLONG)).toThrow(/Invalid cursor/);
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

            test('reads NOT (throws)', () => {
                expect(() => walkableBuffer.get(SHORT, 'NOT' as any)).toThrow(/invalid endianness/i);
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
