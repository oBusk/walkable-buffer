import { isEndianness } from "./Endianness.js";

describe("isEndianness", () => {
    it("handle truthy cases", () => {
        expect(isEndianness("LE")).toBe(true);
        expect(isEndianness("BE")).toBe(true);
    });

    it("handle falsy cases", () => {
        expect(isEndianness("HE")).toBe(false);
        expect(isEndianness("XX")).toBe(false);
        expect(
            isEndianness(
                // @ts-expect-error
                {},
            ),
        ).toBe(false);
        expect(
            isEndianness(
                // @ts-expect-error
                123,
            ),
        ).toBe(false);
        expect(
            isEndianness(
                // @ts-expect-error
                undefined,
            ),
        ).toBe(false);
    });
});
