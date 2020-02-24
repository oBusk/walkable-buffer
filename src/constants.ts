import { Encoding } from './Encoding';
import { Endianness } from './Endianness';

export const OCTET = 1;
export const BYTE = OCTET;
export const SHORT = 2;
export const LONG = 4;
export const LONGLONG = 8;
export const DEFAULT_ENDIANNESS: Endianness = 'LE';
export const DEFAULT_ENCODING: Encoding = 'utf8';
export const DEFAULT_INITIAL_CURSOR: number = 0;
export const DEFAULT_SIGNED = true;
