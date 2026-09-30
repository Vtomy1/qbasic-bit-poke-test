export type BitWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 16 | 24 | 32;

export interface BitWidthMeta {
  width: BitWidth;
  name: string;
  shortName: string;
  minVal: number;
  maxVal: number;
  signedMin?: number;
  signedMax?: number;
  density: string; // e.g. "8 values per byte" or "2 bytes per value"
  typicalUse: string;
  qbasicType: string;
  formulaSummary: string;
}

export interface MemorySegment {
  segment: number; // e.g. 0x8000 (32768) or 0xA000 (VGA)
  baseOffset: number;
  size: number; // buffer size in bytes, default 512 or 1024
  data: Uint8Array;
}

export interface BitOperationTrace {
  bitWidth: BitWidth;
  index: number;
  value: number;
  baseOffset: number;
  affectedBytes: {
    offset: number;
    prevVal: number;
    newVal: number;
    bitsChanged: number[]; // indices 0..7
  }[];
  stepExplanation: string[];
  qbasicCodeSnippet: string;
}

export interface BSAVEHeader {
  signature: number; // 0xFD
  segment: number; // 16-bit
  offset: number; // 16-bit
  length: number; // 16-bit
}
