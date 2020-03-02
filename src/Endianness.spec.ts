/* eslint-disable @typescript-eslint/no-explicit-any */
import { isEndianness } from "./Endianness";

describe("isEndianness", () => {
    it("handle truthy cases", () => {
        expect(isEndianness("LE")).toBe(true);
        expect(isEndianness("BE")).toBe(true);
    });

    it("handle falsy cases", () => {
        expect(isEndianness("HE")).toBe(false);
        expect(isEndianness("XX")).toBe(false);
        expect(isEndianness({} as any)).toBe(false);
        expect(isEndianness(123 as any)).toBe(false);
        expect(isEndianness(undefined as any)).toBe(false);
    });
});
