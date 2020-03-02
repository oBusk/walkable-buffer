import { isEndianness } from './Endianness';

describe('isEndianness', () => {
    it('handle truthy cases', () => {
        expect(isEndianness('LE')).toBe(true);
        expect(isEndianness('BE')).toBe(true);
    });

    it('handle falsy cases', () => {
        expect(isEndianness('HE')).toBe(false);
        expect(isEndianness('XX')).toBe(false);
        expect(isEndianness({})).toBe(false);
        expect(isEndianness(123)).toBe(false);
        expect(isEndianness(undefined)).toBe(false);
    });
});
