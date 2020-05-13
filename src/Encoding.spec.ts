import { isEncoding } from "./Encoding";

describe("isEncoding", () => {
    it("handle truthy cases", () => {
        expect(isEncoding("ascii")).toBe(true);
        expect(isEncoding("utf8")).toBe(true);
        expect(isEncoding("utf16le")).toBe(true);
        expect(isEncoding("ucs2")).toBe(true);
        expect(isEncoding("base64")).toBe(true);
        expect(isEncoding("latin1")).toBe(true);
        expect(isEncoding("binary")).toBe(true);
        expect(isEncoding("hex")).toBe(true);
    });

    it("handle falsy cases", () => {
        expect(isEncoding("HE")).toBe(false);
        expect(isEncoding("XX")).toBe(false);
        expect(
            isEncoding(
                // @ts-expect-error
                {},
            ),
        ).toBe(false);
        expect(
            isEncoding(
                // @ts-expect-error
                123,
            ),
        ).toBe(false);
        expect(
            isEncoding(
                // @ts-expect-error
                undefined,
            ),
        ).toBe(false);
    });
});
