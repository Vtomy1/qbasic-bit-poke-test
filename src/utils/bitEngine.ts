import { BitOperationTrace, BitWidth, BSAVEHeader } from '../types/qbasic';

export const DEFAULT_SEGMENT = 0x8000;
export const DEFAULT_OFFSET = 0x0000;
export const MEMORY_SIZE = 512; // 512 bytes for interactive segment viewer

export function createInitialMemory(size = MEMORY_SIZE): Uint8Array {
  const mem = new Uint8Array(size);
  // Fill with interesting test pattern or zeroes
  for (let i = 0; i < size; i++) {
    mem[i] = 0;
  }
  return mem;
}

export function pokeValue(
  mem: Uint8Array,
  baseOffset: number,
  bitWidth: BitWidth,
  index: number,
  value: number
): { newMem: Uint8Array; trace: BitOperationTrace } {
  const newMem = new Uint8Array(mem.length);
  newMem.set(mem);
  const affected: BitOperationTrace['affectedBytes'] = [];
  const explanations: string[] = [];
  let snippet = '';

  const recordByteChange = (byteOff: number, newVal: number) => {
    const prevVal = mem[byteOff] ?? 0;
    const bitsChanged: number[] = [];
    for (let b = 0; b < 8; b++) {
      if (((prevVal >> b) & 1) !== ((newVal >> b) & 1)) {
        bitsChanged.push(b);
      }
    }
    affected.push({
      offset: byteOff,
      prevVal,
      newVal,
      bitsChanged,
    });
    newMem[byteOff] = newVal;
  };

  switch (bitWidth) {
    case 1: {
      const byteOff = baseOffset + Math.floor(index / 8);
      const bitPos = index % 8;
      const mask = 1 << bitPos;
      const prev = mem[byteOff] ?? 0;
      const bitVal = value ? 1 : 0;
      const updated = bitVal ? (prev | mask) : (prev & (~mask & 0xFF));

      explanations.push(`Bit index ${index} belongs to byte offset ${byteOff} (base + ${index} \\ 8).`);
      explanations.push(`Bit position within byte: bit ${bitPos} (${index} MOD 8).`);
      explanations.push(`Mask: 2^${bitPos} = ${mask} (binary ${mask.toString(2).padStart(8, '0')}).`);
      explanations.push(
        bitVal
          ? `POKE: curByte OR mask => ${prev} OR ${mask} = ${updated}`
          : `POKE: curByte AND (255 - mask) => ${prev} AND ${255 - mask} = ${updated}`
      );
      snippet = `Poke1Bit ${baseOffset}&, ${index}%, ${bitVal}%`;

      recordByteChange(byteOff, updated);
      break;
    }

    case 2: {
      const byteOff = baseOffset + Math.floor(index / 4);
      const shift = (index % 4) * 2;
      const mask = 3 << shift;
      const prev = mem[byteOff] ?? 0;
      const v2 = value & 3;
      const clean = prev & (~mask & 0xFF);
      const updated = clean | (v2 << shift);

      explanations.push(`Index ${index} maps to byte offset ${byteOff} (${index} \\ 4).`);
      explanations.push(`Bit shift: (${index} MOD 4) * 2 = ${shift} bits.`);
      explanations.push(`Mask to clear 2 bits: 3 * (2^${shift}) = ${mask} (binary ${mask.toString(2).padStart(8, '0')}).`);
      explanations.push(`Clean old bits: ${prev} AND ${255 - mask} = ${clean}.`);
      explanations.push(`Insert new value (${v2}): ${clean} OR (${v2} * 2^${shift}) = ${updated}.`);
      snippet = `Poke2Bit ${baseOffset}&, ${index}%, ${v2}%`;

      recordByteChange(byteOff, updated);
      break;
    }

    case 3: {
      const bitPos = index * 3;
      const byteOff = baseOffset + Math.floor(bitPos / 8);
      const shift = bitPos % 8;
      const v3 = value & 7;

      const low = mem[byteOff] ?? 0;
      const high = mem[byteOff + 1] ?? 0;
      const word = low | (high << 8);

      const mask = 7 << shift;
      const newWord = (word & ~mask) | (v3 << shift);
      const newLow = newWord & 0xFF;
      const newHigh = (newWord >> 8) & 0xFF;

      explanations.push(`Index ${index} starts at continuous bit position ${bitPos} (${index} * 3).`);
      explanations.push(`Byte boundary: byte ${byteOff}, shift within byte = ${shift} bits.`);
      explanations.push(`16-bit word read across boundary: low byte ${low}, high byte ${high} (word = ${word}).`);
      explanations.push(`16-bit mask: 7 * 2^${shift} = ${mask} (binary ${mask.toString(2).padStart(16, '0')}).`);
      explanations.push(`New 16-bit word: ${newWord} -> low byte: ${newLow}, high byte: ${newHigh}.`);
      snippet = `Poke3Bit ${baseOffset}&, ${index}%, ${v3}%`;

      recordByteChange(byteOff, newLow);
      if (byteOff + 1 < mem.length) {
        recordByteChange(byteOff + 1, newHigh);
      }
      break;
    }

    case 4: {
      const byteOff = baseOffset + Math.floor(index / 2);
      const isHigh = index % 2 === 1;
      const prev = mem[byteOff] ?? 0;
      const v4 = value & 0x0F;
      const updated = isHigh ? (prev & 0x0F) | (v4 << 4) : (prev & 0xF0) | v4;

      explanations.push(`Index ${index} maps to byte offset ${byteOff} (${index} \\ 2).`);
      explanations.push(
        isHigh
          ? `High nibble (bits 4..7): preserves low nibble (&H0F), writes (value * 16).`
          : `Low nibble (bits 0..3): preserves high nibble (&HF0), writes value directly.`
      );
      explanations.push(`POKE byte: ${prev} -> ${updated} (hex &H${updated.toString(16).toUpperCase().padStart(2, '0')}).`);
      snippet = `Poke4Bit ${baseOffset}&, ${index}%, ${v4}%`;

      recordByteChange(byteOff, updated);
      break;
    }

    case 5: {
      const bitPos = index * 5;
      const byteOff = baseOffset + Math.floor(bitPos / 8);
      const shift = bitPos % 8;
      const v5 = value & 31;

      const low = mem[byteOff] ?? 0;
      const high = mem[byteOff + 1] ?? 0;
      const word = low | (high << 8);

      const mask = 31 << shift;
      const newWord = (word & ~mask) | (v5 << shift);
      const newLow = newWord & 0xFF;
      const newHigh = (newWord >> 8) & 0xFF;

      explanations.push(`Continuous bit position: ${bitPos} (${index} * 5).`);
      explanations.push(`Spans byte ${byteOff} (shift ${shift}) and byte ${byteOff + 1}.`);
      explanations.push(`Mask: 31 * (2^${shift}) = ${mask}.`);
      explanations.push(`Updated low byte: ${newLow}, high byte: ${newHigh}.`);
      snippet = `Poke5Bit ${baseOffset}&, ${index}%, ${v5}%`;

      recordByteChange(byteOff, newLow);
      if (byteOff + 1 < mem.length) {
        recordByteChange(byteOff + 1, newHigh);
      }
      break;
    }

    case 6: {
      const bitPos = index * 6;
      const byteOff = baseOffset + Math.floor(bitPos / 8);
      const shift = bitPos % 8;
      const v6 = value & 63;

      const low = mem[byteOff] ?? 0;
      const high = mem[byteOff + 1] ?? 0;
      const word = low | (high << 8);

      const mask = 63 << shift;
      const newWord = (word & ~mask) | (v6 << shift);
      const newLow = newWord & 0xFF;
      const newHigh = (newWord >> 8) & 0xFF;

      explanations.push(`6-bit DAC register packing at bit ${bitPos} (byte ${byteOff}, shift ${shift}).`);
      explanations.push(`Value: ${v6} (0..63) -> 16-bit masked word update.`);
      snippet = `Poke6Bit ${baseOffset}&, ${index}%, ${v6}%`;

      recordByteChange(byteOff, newLow);
      if (byteOff + 1 < mem.length) {
        recordByteChange(byteOff + 1, newHigh);
      }
      break;
    }

    case 7: {
      const bitPos = index * 7;
      const byteOff = baseOffset + Math.floor(bitPos / 8);
      const shift = bitPos % 8;
      const v7 = value & 127;

      const low = mem[byteOff] ?? 0;
      const high = mem[byteOff + 1] ?? 0;
      const word = low | (high << 8);

      const mask = 127 << shift;
      const newWord = (word & ~mask) | (v7 << shift);
      const newLow = newWord & 0xFF;
      const newHigh = (newWord >> 8) & 0xFF;

      explanations.push(`7-bit ASCII/MIDI bitstream at bit ${bitPos} (byte ${byteOff}, shift ${shift}).`);
      explanations.push(`Mask 127 * (2^${shift}) = ${mask}. Low: ${newLow}, High: ${newHigh}.`);
      snippet = `Poke7Bit ${baseOffset}&, ${index}%, ${v7}%`;

      recordByteChange(byteOff, newLow);
      if (byteOff + 1 < mem.length) {
        recordByteChange(byteOff + 1, newHigh);
      }
      break;
    }

    case 8: {
      const byteOff = baseOffset + index;
      const v8 = value & 255;
      explanations.push(`Standard 8-bit single byte at offset ${byteOff}.`);
      explanations.push(`Direct POKE: POKE ${byteOff}&, ${v8}`);
      snippet = `Poke8Bit ${byteOff}&, ${v8}%`;

      recordByteChange(byteOff, v8);
      break;
    }

    case 16: {
      const off = baseOffset + index * 2;
      const v16 = value & 0xFFFF;
      const low = v16 & 0xFF;
      const high = (v16 >> 8) & 0xFF;

      explanations.push(`16-bit word (INTEGER) at offset ${off} (2 bytes Little-Endian).`);
      explanations.push(`Byte 0 (Low): ${v16} AND 255 = ${low} (&H${low.toString(16).toUpperCase()})`);
      explanations.push(`Byte 1 (High): (${v16} \\ 256) AND 255 = ${high} (&H${high.toString(16).toUpperCase()})`);
      snippet = `Poke16Bit ${off}&, ${v16}&`;

      recordByteChange(off, low);
      recordByteChange(off + 1, high);
      break;
    }

    case 24: {
      const off = baseOffset + index * 3;
      const v24 = value & 0xFFFFFF;
      const b0 = v24 & 0xFF;
      const b1 = (v24 >> 8) & 0xFF;
      const b2 = (v24 >> 16) & 0xFF;

      explanations.push(`24-bit TrueColor RGB at offset ${off} (3 bytes Little-Endian).`);
      explanations.push(`Byte 0 (Low): ${b0} (&H${b0.toString(16).toUpperCase()})`);
      explanations.push(`Byte 1 (Mid): ${b1} (&H${b1.toString(16).toUpperCase()})`);
      explanations.push(`Byte 2 (High): ${b2} (&H${b2.toString(16).toUpperCase()})`);
      snippet = `Poke24Bit ${off}&, ${v24}&`;

      recordByteChange(off, b0);
      recordByteChange(off + 1, b1);
      recordByteChange(off + 2, b2);
      break;
    }

    case 32: {
      const off = baseOffset + index * 4;
      const v32 = value >>> 0;
      const b0 = v32 & 0xFF;
      const b1 = (v32 >>> 8) & 0xFF;
      const b2 = (v32 >>> 16) & 0xFF;
      const b3 = (v32 >>> 24) & 0xFF;

      explanations.push(`32-bit DWORD (LONG) at offset ${off} (4 bytes Little-Endian).`);
      explanations.push(`Byte 0: ${b0}, Byte 1: ${b1}, Byte 2: ${b2}, Byte 3: ${b3}.`);
      explanations.push(
        b3 >= 128
          ? `Bit 31 is set: in QBasic signed LONG this represents a negative value.`
          : `Bit 31 is 0: positive value in QBasic signed LONG.`
      );
      snippet = `Poke32Bit ${off}&, ${value}&`;

      recordByteChange(off, b0);
      recordByteChange(off + 1, b1);
      recordByteChange(off + 2, b2);
      recordByteChange(off + 3, b3);
      break;
    }
  }

  const trace: BitOperationTrace = {
    bitWidth,
    index,
    value,
    baseOffset,
    affectedBytes: affected,
    stepExplanation: explanations,
    qbasicCodeSnippet: snippet,
  };

  return { newMem, trace };
}

export function peekValue(
  mem: Uint8Array,
  baseOffset: number,
  bitWidth: BitWidth,
  index: number
): number {
  switch (bitWidth) {
    case 1: {
      const byteOff = baseOffset + Math.floor(index / 8);
      const bitPos = index % 8;
      return ((mem[byteOff] ?? 0) >> bitPos) & 1;
    }
    case 2: {
      const byteOff = baseOffset + Math.floor(index / 4);
      const shift = (index % 4) * 2;
      return ((mem[byteOff] ?? 0) >> shift) & 3;
    }
    case 3: {
      const bitPos = index * 3;
      const byteOff = baseOffset + Math.floor(bitPos / 8);
      const shift = bitPos % 8;
      const low = mem[byteOff] ?? 0;
      const high = mem[byteOff + 1] ?? 0;
      const word = low | (high << 8);
      return (word >> shift) & 7;
    }
    case 4: {
      const byteOff = baseOffset + Math.floor(index / 2);
      const isHigh = index % 2 === 1;
      const byte = mem[byteOff] ?? 0;
      return isHigh ? (byte >> 4) & 0x0F : byte & 0x0F;
    }
    case 5: {
      const bitPos = index * 5;
      const byteOff = baseOffset + Math.floor(bitPos / 8);
      const shift = bitPos % 8;
      const low = mem[byteOff] ?? 0;
      const high = mem[byteOff + 1] ?? 0;
      const word = low | (high << 8);
      return (word >> shift) & 31;
    }
    case 6: {
      const bitPos = index * 6;
      const byteOff = baseOffset + Math.floor(bitPos / 8);
      const shift = bitPos % 8;
      const low = mem[byteOff] ?? 0;
      const high = mem[byteOff + 1] ?? 0;
      const word = low | (high << 8);
      return (word >> shift) & 63;
    }
    case 7: {
      const bitPos = index * 7;
      const byteOff = baseOffset + Math.floor(bitPos / 8);
      const shift = bitPos % 8;
      const low = mem[byteOff] ?? 0;
      const high = mem[byteOff + 1] ?? 0;
      const word = low | (high << 8);
      return (word >> shift) & 127;
    }
    case 8: {
      return mem[baseOffset + index] ?? 0;
    }
    case 16: {
      const off = baseOffset + index * 2;
      const low = mem[off] ?? 0;
      const high = mem[off + 1] ?? 0;
      return low | (high << 8);
    }
    case 24: {
      const off = baseOffset + index * 3;
      const b0 = mem[off] ?? 0;
      const b1 = mem[off + 1] ?? 0;
      const b2 = mem[off + 2] ?? 0;
      return b0 | (b1 << 8) | (b2 << 16);
    }
    case 32: {
      const off = baseOffset + index * 4;
      const b0 = mem[off] ?? 0;
      const b1 = mem[off + 1] ?? 0;
      const b2 = mem[off + 2] ?? 0;
      const b3 = mem[off + 3] ?? 0;
      return (b0 | (b1 << 8) | (b2 << 16) | (b3 << 24)) >>> 0;
    }
  }
}

/**
 * Creates authentic MS-DOS BSAVE binary file data with 7-byte header:
 * Byte 0: 0xFD
 * Bytes 1-2: Segment (Little-Endian)
 * Bytes 3-4: Offset (Little-Endian)
 * Bytes 5-6: Length (Little-Endian)
 * Bytes 7+: Raw payload
 */
export function buildBSAVEFile(
  mem: Uint8Array,
  segment: number,
  offset: number,
  length: number
): Uint8Array {
  const len = Math.min(length, mem.length - offset);
  const out = new Uint8Array(7 + len);

  out[0] = 0xFD; // Signature
  out[1] = segment & 0xFF;
  out[2] = (segment >> 8) & 0xFF;
  out[3] = offset & 0xFF;
  out[4] = (offset >> 8) & 0xFF;
  out[5] = len & 0xFF;
  out[6] = (len >> 8) & 0xFF;

  for (let i = 0; i < len; i++) {
    out[7 + i] = mem[offset + i] ?? 0;
  }

  return out;
}

/**
 * Parses BSAVE binary data and returns header and payload.
 */
export function parseBSAVEFile(data: Uint8Array): {
  header: BSAVEHeader | null;
  payload: Uint8Array;
} {
  if (data.length < 7 || data[0] !== 0xFD) {
    return { header: null, payload: data };
  }

  const header: BSAVEHeader = {
    signature: data[0],
    segment: data[1] | (data[2] << 8),
    offset: data[3] | (data[4] << 8),
    length: data[5] | (data[6] << 8),
  };

  const payload = data.slice(7);
  return { header, payload };
}

/**
 * Generates sample presets (CGA sprite, EGA icons, 24-bit gradients, etc.)
 */
export function generatePreset(mem: Uint8Array, type: string): Uint8Array {
  const next = new Uint8Array(mem.length);
  next.set(mem);
  switch (type) {
    case 'cga_pattern': {
      // 2-bit CGA pattern: alternating 0, 1, 2, 3 colors
      for (let i = 0; i < 64; i++) {
        const val = i % 4;
        const byteOff = Math.floor(i / 4);
        const shift = (i % 4) * 2;
        const mask = 3 << shift;
        next[byteOff] = (next[byteOff] & (~mask & 0xFF)) | (val << shift);
      }
      break;
    }
    case 'ega_gradient': {
      // 4-bit EGA nibbles 0..15 across 32 bytes (64 nibbles)
      for (let i = 0; i < 64; i++) {
        const color = i % 16;
        const byteOff = Math.floor(i / 2);
        const isHigh = i % 2 === 1;
        next[byteOff] = isHigh
          ? (next[byteOff] & 0x0F) | (color << 4)
          : (next[byteOff] & 0xF0) | color;
      }
      break;
    }
    case 'monochrome_text': {
      // 1-bit smile/cross bitmap in first 16 bytes
      const pattern = [
        0b00111100, 0b01000010, 0b10100101, 0b10000001,
        0b10100101, 0b10011001, 0b01000010, 0b00111100,
        0b11111111, 0b10000001, 0b10111101, 0b10100101,
        0b10100101, 0b10111101, 0b10000001, 0b11111111,
      ];
      for (let i = 0; i < pattern.length; i++) {
        next[i] = pattern[i];
      }
      break;
    }
    case 'multi_ints': {
      // 16-bit and 32-bit test data
      const ints = [1024, 2048, 4096, 8192, 16384, 32768, 54321];
      ints.forEach((v, idx) => {
        const off = idx * 2;
        next[off] = v & 0xFF;
        next[off + 1] = (v >> 8) & 0xFF;
      });
      break;
    }
    case 'all_zero': {
      next.fill(0);
      break;
    }
    case 'all_ones': {
      next.fill(0xFF);
      break;
    }
  }
  return next;
}
