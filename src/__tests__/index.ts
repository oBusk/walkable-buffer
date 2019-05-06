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

            buffer.write('XXXX', 0, 4);

            expect(buffer.toString()).toBe('XXXX');
            expect(wBuf.getString(4)).toBe('ABCD');
            expect(wBuf.getSourceBuffer().toString()).toBe('ABCD');
        });
    });
});

describe('integer functions', () => {
    let buffer: Buffer;
    let walkableBuffer: WalkableBuffer;

    describe('48bits', () => {

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

    describe('64bits', () => {
        describe('values', () => {
            test('can get 0', () => {
                buffer = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                walkableBuffer = new WalkableBuffer(buffer);

                expect(walkableBuffer.get64().toString()).toBe('0');
            });

            test('can get maximum number', () => {
                buffer = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F]);
                walkableBuffer = new WalkableBuffer(buffer);

                expect(walkableBuffer.get64().toString()).toBe('9223372036854775807');
            });

            test('can get minimum number', () => {
                buffer = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80]);
                walkableBuffer = new WalkableBuffer(buffer);

                expect(walkableBuffer.get64().toString()).toBe('-9223372036854775807');
            });
        });

        describe('positioning', () => {
            beforeEach(() => {
                buffer = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F]);
                walkableBuffer = new WalkableBuffer(buffer);
            });

            test('advances position', () => {
                expect(walkableBuffer.get64().toString()).toBe('9223372036854775807');
                expect(walkableBuffer.getCurrentPos()).toBe(8);
            });

            test('throws if trying to get more than left and does not advance position when failing', () => {
                buffer = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F]);
                walkableBuffer = new WalkableBuffer(buffer);

                expect(() => walkableBuffer.get64()).toThrow();
                expect(walkableBuffer.getCurrentPos()).toBe(0);
            });

            test('throws if trying to get more than left and does not advance position when failing', () => {
                buffer = Buffer.from([
                    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F,
                    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F,
                ]);
                walkableBuffer = new WalkableBuffer(buffer);

                expect(() => walkableBuffer.get64()).not.toThrow();
                expect(walkableBuffer.getCurrentPos()).toBe(8);
                expect(() => walkableBuffer.get64()).not.toThrow();
                expect(walkableBuffer.getCurrentPos()).toBe(16);
                expect(() => walkableBuffer.get64()).toThrow();
                expect(walkableBuffer.getCurrentPos()).toBe(16);
                expect(() => walkableBuffer.get64()).toThrow();
                expect(walkableBuffer.getCurrentPos()).toBe(16);
            });
        });

        describe('endianness', () => {
            beforeEach(() => {
                buffer = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F]);
                walkableBuffer = new WalkableBuffer(buffer);
            });

            test('reads default (LE)', () => {
                expect(walkableBuffer.get64().toString()).toBe('9223372036854775807');
            });

            test('reads LE', () => {
                expect(walkableBuffer.get64('LE').toString()).toBe('9223372036854775807');
            });

            test('reads BE', () => {
                expect(walkableBuffer.get64('BE').toString()).toBe('-129');
            });

            test('reads NOT (throws)', () => {
                expect(() => walkableBuffer.get64('NOT' as any)).toThrow(/invalid endianness/i);
            });
        });

        describe('signed', () => {
            let ff: Buffer;
            let ffWB: WalkableBuffer;
            let ze: Buffer;
            let zeWB: WalkableBuffer;

            beforeEach(() => {
                ze = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                zeWB = new WalkableBuffer(ze);

                ff = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
                ffWB = new WalkableBuffer(ff);

                buffer = Buffer.from([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77]);
                walkableBuffer = new WalkableBuffer(buffer);
            });

            test('reads default (signed) LE', () => {
                expect(zeWB.get64('LE').toString()).toBe('0');
                expect(ffWB.get64('LE').toString()).toBe('-1');
                expect(walkableBuffer.get64('LE').toString()).toBe('8603657889541918976');
            });

            test('reads default (signed) BE', () => {
                expect(zeWB.get64('BE').toString()).toBe('0');
                expect(ffWB.get64('BE').toString()).toBe('-1');
                expect(walkableBuffer.get64('BE').toString()).toBe('4822678189205111');
            });

            test('reads signed LE', () => {
                expect(zeWB.get64('LE').toString()).toBe('0');
                expect(ffWB.get64('LE').toString()).toBe('-1');
                expect(walkableBuffer.get64('LE').toString()).toBe('8603657889541918976');
            });

            test('reads signed BE', () => {
                expect(zeWB.get64('BE').toString()).toBe('0');
                expect(ffWB.get64('BE').toString()).toBe('-1');
                expect(walkableBuffer.get64('BE').toString()).toBe('4822678189205111');
            });

            test('reads unsigned LE', () => {
                expect(zeWB.get64('LE', true).toString()).toBe('0');
                expect(ffWB.get64('LE', true).toString()).toBe('18446744073709551615');
                expect(walkableBuffer.get64('LE', true).toString()).toBe('8603657889541918976');
            });

            test('reads unsigned BE', () => {
                expect(zeWB.get64('BE', true).toString()).toBe('0');
                expect(ffWB.get64('BE', true).toString()).toBe('18446744073709551615');
                expect(walkableBuffer.get64('BE', true).toString()).toBe('4822678189205111');
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

            test('throws on invalid encoding', () => {
                expect(() => u16walkableBuffer.getString(1, 'notAnEncoding' as any)).toThrow(/unknown encoding/i);
            });
        });

        describe('position and size', () => {
            test('advances position when reading', () => {
                expect(u16walkableBuffer.getString(0x5 * 2)).toBe('Hellö');
                expect(u16walkableBuffer.getCurrentPos()).toBe(10);
            });

            test('does not fail when using 0 size, without changing cursor', () => {
                expect(() => u16walkableBuffer.getString(0)).not.toThrow();
                expect(u16walkableBuffer.getCurrentPos()).toBe(0);
            });

            test('fails when using negative size, without changing cursor', () => {
                expect(() => u16walkableBuffer.getString(-1)).toThrow();
                expect(u16walkableBuffer.getCurrentPos()).toBe(0);
            });

            test('fails when reading outside buffer, without advancing cursor', () => {
                expect(() => u16walkableBuffer.getString((0xB * 2) + 1)).toThrow();
                expect(u16walkableBuffer.getCurrentPos()).toBe(0);
            });
        });
    });

    describe('peekString', () => {
        test('reads string of size', () => expect(u16walkableBuffer.peekString(0xB * 2)).toBe('Hellö Worlδ'));

        describe('encoding', () => {
            test('read string as utf-8', () => {
                const u8Buffer = Buffer.from(
                    [0x48, 0x65, 0x6C, 0x6C, 0xC3, 0xB6, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0xCE, 0xB4],
                ); // Hellö Worlδ in Unicode
                const u8WalkableBuffer = new WalkableBuffer(u8Buffer, undefined, 'utf8');

                expect(u8WalkableBuffer.peekString(0xD)).toBe('Hellö Worlδ');
            });

            test('read string as ascii', () => {
                const asciiBuffer = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F]); // Hello in ascii
                const asciiWalkableBuffer = new WalkableBuffer(asciiBuffer, undefined, 'ascii');

                expect(asciiWalkableBuffer.peekString(0x5)).toBe('Hello');
            });

            test('throws on invalid encoding', () => {
                expect(() => u16walkableBuffer.peekString(1, 0, 'notAnEncoding' as any)).toThrow(/unknown encoding/i);
            });
        });

        describe('size and position', () => {
            let wBuf: WalkableBuffer;

            const length = 'Hellö Worlδ'.length * 2; // 22, 0x16
            const startingPosition = 'Hellö '.length * 2; // 12, 0xC
            const minByteOffset = -(startingPosition); // -12
            const maxByteOffset = length - startingPosition - 1; // 10

            beforeEach(() => {
                wBuf = new WalkableBuffer(u16buffer, undefined, 'utf16le', startingPosition);
            });

            afterEach(() => {
                expect(wBuf.getCurrentPos()).toBe(startingPosition);
            });

            describe('sizes', () => {
                test('handles size 1', () => expect(() => wBuf.peekString(1)).not.toThrow());
                test('handles size 0', () => expect(() => wBuf.peekString(0)).not.toThrow());
                test('throws on negative size', () => expect(() => wBuf.peekString(-1)).toThrow(/out of range/i));
                test(
                    'handles maxiumum size',
                    () => expect(() => wBuf.peekString(length - startingPosition)).not.toThrow(),
                );
                test(
                    'throws on maximum size + 1',
                    () => expect(() => wBuf.peekString((length - startingPosition) + 1)).toThrow(/out of range/i),
                );
            });

            describe('byteOffsets', () => {

                test('no byteOffset (default 0)', () => expect(wBuf.peekString(0x5 * 2)).toBe('Worlδ'));
                test('minimum byteOffset', () => expect(wBuf.peekString(0xB * 2, minByteOffset)).toBe('Hellö Worlδ'));
                test(
                    'minimum byteOffset - 1 (should throw)',
                    () => expect(() => wBuf.peekString(1, minByteOffset - 1)).toThrow(/byteOffset/),
                );
                // Only reads last byte, cant make actual character
                test('maximum byteOffset', () => expect(wBuf.peekString(1, 0x9)).toBe(''));
                test(
                    'maximym byteOffset + 1 (should throw)',
                    () => expect(() => wBuf.peekString(1, maxByteOffset + 1)).toThrow(/byteOffset/),
                );
            });
        });
    });

    describe('getSizedString', () => {
        test('utf-8, LE, SHORT size-describer', () => {
            const u8le = new WalkableBuffer(
                Buffer.from([
                    0x0D, 0x00, 0x48, 0x65, 0x6C, 0x6C, 0xC3, 0xB6,
                    0x20, 0x57, 0x6F, 0x72, 0x6C, 0xCE, 0xB4,
                ]),
                'LE',
                'utf8',
            );

            expect(u8le.getSizedString(SHORT)).toBe('Hellö Worlδ');
            expect(u8le.getCurrentPos()).toBe(0x0F);
        });

        test('utf-8, BE, SHORT size-describer', () => {
            const u8be = new WalkableBuffer(
                Buffer.from([
                    0x00, 0x0D, 0x48, 0x65, 0x6C, 0x6C, 0xC3, 0xB6,
                    0x20, 0x57, 0x6F, 0x72, 0x6C, 0xCE, 0xB4,
                ]),
                'BE',
                'utf8',
            );

            expect(u8be.getSizedString(SHORT)).toBe('Hellö Worlδ');
            expect(u8be.getCurrentPos()).toBe(0x0F);
        });

        test('UTF16le, LE, LONG size-describer', () => {
            const u16le = new WalkableBuffer(
                Buffer.from([
                    0x0B, 0x00, 0x00, 0x00, 0x48, 0x00, 0x65, 0x00,
                    0x6C, 0x00, 0x6C, 0x00, 0xF6, 0x00, 0x20, 0x00,
                    0x57, 0x00, 0x6F, 0x00, 0x72, 0x00, 0x6C, 0x00,
                    0xB4, 0x03,
                ]),
                'LE',
                'utf16le',
            );

            expect(u16le.getSizedString()).toBe('Hellö Worlδ');
            expect(u16le.getCurrentPos()).toBe(0x1A);
        });

        test('override defaults', () => {
            /** A walkable buffer with incorrect endianness and encoding. */
            const wBuf = new WalkableBuffer(
                Buffer.from([
                    0x00, 0x0D, 0x48, 0x65, 0x6C, 0x6C, 0xC3, 0xB6,
                    0x20, 0x57, 0x6F, 0x72, 0x6C, 0xCE, 0xB4,
                ]),
                'LE',
                'utf16le',
            );

            expect(wBuf.getSizedString(SHORT, 'BE', 'utf8')).toBe('Hellö Worlδ');
            expect(wBuf.getCurrentPos()).toBe(0x0F);
        });

        test('fails on too large size descriptor, without advancing cursor', () => {
            const u8le = new WalkableBuffer(
                Buffer.from([
                    0xFF, 0x00, 0x48, 0x65, 0x6C, 0x6C, 0xC3, 0xB6,
                    0x20, 0x57, 0x6F, 0x72, 0x6C, 0xCE, 0xB4,
                ]),
                'LE',
                'utf8',
            );

            expect(() => u8le.getSizedString(SHORT)).toThrow(/out of range/i);
            expect(u8le.getCurrentPos()).toBe(0);
        });

        test('handles descriptor being value 0', () => {
            const u8le = new WalkableBuffer(
                Buffer.from([
                    0x00, 0x00, 0x48, 0x65, 0x6C, 0x6C, 0xC3, 0xB6,
                    0x20, 0x57, 0x6F, 0x72, 0x6C, 0xCE, 0xB4,
                ]),
                'LE',
                'utf8',
            );

            expect(() => u8le.getSizedString(SHORT)).not.toThrow();
            expect(u8le.getCurrentPos()).toBe(0x02);
        });
    });

    describe('getBuffer', () => {
        let wBuf: WalkableBuffer;

        beforeEach(() => {
            wBuf = new WalkableBuffer(
                Buffer.from([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F,
                ]),
                undefined,
                undefined,
                0x04,
            );
        });

        test('Basic case, return remaining buffer', () => {
            const buffer = wBuf.getBuffer();

            expect(buffer).toBeInstanceOf(Buffer);
            expect(buffer.length).toBe(0x0C);
            expect(wBuf.getCurrentPos()).toBe(0x10);
        });

        test('get 1 byte', () => {
            const buffer = wBuf.getBuffer(1);

            expect(buffer).toBeInstanceOf(Buffer);
            expect(buffer.length).toBe(1);
            expect(wBuf.getCurrentPos()).toBe(0x05);
        });

        test('get maximum size buffer', () => {
            const buffer = wBuf.getBuffer(0x0C);

            expect(buffer).toBeInstanceOf(Buffer);
            expect(buffer.length).toBe(0x0C);
            expect(wBuf.getCurrentPos()).toBe(0x10);
        });

        test('fails on maximum size + 1', () => {
            expect(() => wBuf.getBuffer(0x0D)).toThrow(/out of range/i);
            expect(wBuf.getCurrentPos()).toBe(0x04);
        });

        test('fails on byteLength 0', () => {
            expect(() => wBuf.getBuffer(0)).toThrow(/out of range/i);
            expect(wBuf.getCurrentPos()).toBe(0x04);
        });
    });

    describe('skip', () => {
        let wBuf: WalkableBuffer;

        beforeEach(() => {
            wBuf = new WalkableBuffer(
                Buffer.from([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F,
                ]),
                undefined,
                undefined,
                0x04,
            );
        });

        test('-1 (throws)', () => {
            expect(() => wBuf.skip(-1)).toThrow(/out of range/i);
            expect(wBuf.getCurrentPos()).toBe(0x04);
        });

        test('0 (throws)', () => {
            expect(() => wBuf.skip(0)).toThrow(/out of range/i);
            expect(wBuf.getCurrentPos()).toBe(0x04);
        });

        test('1', () => {
            expect(() => wBuf.skip(1)).not.toThrow();
            expect(wBuf.getCurrentPos()).toBe(0x05);
        });

        test('maximum possible', () => {
            expect(() => wBuf.skip(0x0C)).not.toThrow();
            expect(wBuf.getCurrentPos()).toBe(0x10);
        });

        test('maximum possible + 1 /throws)', () => {
            expect(() => wBuf.skip(0x0D)).toThrow(/out of range/i);
            expect(wBuf.getCurrentPos()).toBe(0x04);
        });
    });

    describe('getters/setters for configuration', () => {
        let wBuf: WalkableBuffer;

        beforeEach(() => {
            wBuf = new WalkableBuffer(
                Buffer.from([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                    0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F,
                ]),
                undefined,
                undefined,
                0x04,
            );
        });

        describe('position', () => {
            describe('getter', () => {
                test('get initial value', () => expect(wBuf.getCurrentPos()).toBe(0x04));
            });

            describe('setter', () => {
                test('goto -1 (throws)', () => {
                    expect(() => wBuf.goTo(-1)).toThrow(/out of range/i);
                    expect(wBuf.getCurrentPos()).toBe(0x04);
                });

                test('goto 0', () => {
                    expect(() => wBuf.goTo(0)).not.toThrow();
                    expect(wBuf.getCurrentPos()).toBe(0);
                });

                test('goto 2', () => {
                    expect(() => wBuf.goTo(0x02)).not.toThrow();
                    expect(wBuf.getCurrentPos()).toBe(0x02);
                });

                test('goto 15', () => {
                    expect(() => wBuf.goTo(0x0F)).not.toThrow();
                    expect(wBuf.getCurrentPos()).toBe(0x0F);
                });

                test('goto 16 (throws)', () => {
                    expect(() => wBuf.goTo(0x10)).toThrow(/out of range/i);
                    expect(wBuf.getCurrentPos()).toBe(0x04);
                });
            });
        });

        describe('endianness', () => {
            describe('getter', () => {
                test('get initial value', () => expect(wBuf.getEndianness()).toBe('LE'));
            });

            describe('setter', () => {
                test('set BE', () => {
                    expect(wBuf.setEndianness('BE')).toBe('BE');
                    expect(wBuf.getEndianness()).toBe('BE');
                });

                test('set LE', () => {
                    expect(wBuf.setEndianness('LE')).toBe('LE');
                    expect(wBuf.getEndianness()).toBe('LE');
                });

                test('set NOT (throws)', () => {
                    expect(() => wBuf.setEndianness('NOT' as any)).toThrow();
                    expect(wBuf.getEndianness()).toBe('LE');
                });
            });
        });

        describe('encoding', () => {
            describe('getter', () => {
                test('get intiial value', () => expect(wBuf.getEncoding()).toBe('utf8'));
            });

            describe('setter', () => {
                // 'ascii' | 'utf8' | 'utf16le' | 'ucs2' | 'base64' | 'hex'
                test('set ascii', () => {
                    expect(wBuf.setEncoding('ascii')).toBe('ascii');
                    expect(wBuf.getEncoding()).toBe('ascii');
                });

                test('set utf8', () => {
                    expect(wBuf.setEncoding('utf8')).toBe('utf8');
                    expect(wBuf.getEncoding()).toBe('utf8');
                });

                test('set utf16le', () => {
                    expect(wBuf.setEncoding('utf16le')).toBe('utf16le');
                    expect(wBuf.getEncoding()).toBe('utf16le');
                });

                test('set ucs2', () => {
                    expect(wBuf.setEncoding('ucs2')).toBe('ucs2');
                    expect(wBuf.getEncoding()).toBe('ucs2');
                });

                test('set base64', () => {
                    expect(wBuf.setEncoding('base64')).toBe('base64');
                    expect(wBuf.getEncoding()).toBe('base64');
                });

                test('set hex', () => {
                    expect(wBuf.setEncoding('hex')).toBe('hex');
                    expect(wBuf.getEncoding()).toBe('hex');
                });

                test('set NOT (throws)', () => {
                    expect(() => wBuf.setEncoding('NOT' as any)).toThrow(/invalid encoding/i);
                    expect(wBuf.getEncoding()).toBe('utf8');
                });
            });
        });
    });

    describe('getSourceBuffer', () => {
        test('returns buffer', () => {
            const wBuf = new WalkableBuffer(
                Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]),
                undefined,
                undefined,
                0x02,
            );

            const buffer = wBuf.getSourceBuffer();

            expect(buffer).toBeInstanceOf(Buffer);
            expect(buffer.length).toBe(0x08);
        });
    });

    describe('size', () => {
        test('gets size matching actual buffer', () => {
            const wBuf = new WalkableBuffer(
                Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]),
                undefined,
                undefined,
                0x02,
            );

            const buffer = wBuf.getSourceBuffer();

            expect(wBuf.size()).toBe(buffer.length);
        });
    });

    describe('sizeRemainingBuffer', () => {
        let buffer: Buffer;

        beforeEach(() => {
            buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
        });

        test('when cursor is 0', () => {
            const wBuf = new WalkableBuffer(buffer, undefined, undefined, 0);

            expect(wBuf.sizeRemainingBuffer()).toBe(8);
        });

        test('when cursor is 4', () => {
            const wBuf = new WalkableBuffer(buffer, undefined, undefined, 4);

            expect(wBuf.sizeRemainingBuffer()).toBe(4);
        });

        test('when cursor is 7', () => {
            const wBuf = new WalkableBuffer(buffer, undefined, undefined, 7);

            expect(wBuf.sizeRemainingBuffer()).toBe(1);
        });
    });
});
