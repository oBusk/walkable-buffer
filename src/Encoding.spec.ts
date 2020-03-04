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
        expect(isEncoding({} as any)).toBe(false);
        expect(isEncoding(123 as any)).toBe(false);
        expect(isEncoding(undefined as any)).toBe(false);
    });
});
