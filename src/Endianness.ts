/**
 * The endianness to read numbers with.
 *
 * * `LE` - for little-endian
 * * `BE` - for big-endian
 */
export type Endianness = "BE" | "LE";

/** Asserts that `check` is either string `LE` or string `BE`. */
export function isEndianness(check: string): check is Endianness {
    return typeof check === "string" && (check === "LE" || check === "BE");
}
