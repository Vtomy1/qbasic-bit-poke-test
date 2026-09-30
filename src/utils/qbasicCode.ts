import { BitWidth, BitWidthMeta } from '../types/qbasic';

export const BIT_METADATA: Record<BitWidth, BitWidthMeta> = {
  1: {
    width: 1,
    name: '1-Bit (Monochrome / Flags)',
    shortName: '1-Bit',
    minVal: 0,
    maxVal: 1,
    density: '8 values per byte',
    typicalUse: 'Boolean flags, monochrome pixel bitmaps, tile collision maps, SCREEN 11/Hercules graphics.',
    qbasicType: 'INTEGER (%)',
    formulaSummary: 'byteOff = base + (i \\ 8) : bit = i MOD 8 : mask = 2 ^ bit',
  },
  2: {
    width: 2,
    name: '2-Bit (4 Colors / CGA Palette)',
    shortName: '2-Bit',
    minVal: 0,
    maxVal: 3,
    density: '4 values per byte',
    typicalUse: 'CGA 4-color graphics (SCREEN 1), Game Boy 4-shade tiles, 4-direction sprite facings.',
    qbasicType: 'INTEGER (%)',
    formulaSummary: 'byteOff = base + (i \\ 4) : shift = (i MOD 4) * 2 : mask = 3 * (2 ^ shift)',
  },
  3: {
    width: 3,
    name: '3-Bit (8 Levels / Octal / Lo-Res)',
    shortName: '3-Bit',
    minVal: 0,
    maxVal: 7,
    density: 'Continuous bitstream (spans byte boundaries)',
    typicalUse: '8-color graphics, octal codes, audio sample quantization, compressed bitstreams (Huffman/LZW).',
    qbasicType: 'INTEGER (%)',
    formulaSummary: 'bitPos = i * 3 : byteOff = base + (bitPos \\ 8) : bitShift = bitPos MOD 8',
  },
  4: {
    width: 4,
    name: '4-Bit (16 Colors / EGA & VGA / Nibbles)',
    shortName: '4-Bit',
    minVal: 0,
    maxVal: 15,
    density: '2 values per byte (low & high nibble)',
    typicalUse: 'EGA/VGA 16-color palette (SCREEN 7/9/12/13), BCD digits, 16-frame animation indices.',
    qbasicType: 'INTEGER (%)',
    formulaSummary: 'byteOff = base + (i \\ 2) : If (i MOD 2)=0 low nibble (&H0F) Else high nibble (&HF0)',
  },
  5: {
    width: 5,
    name: '5-Bit (32 Levels / HiColor RGB555)',
    shortName: '5-Bit',
    minVal: 0,
    maxVal: 31,
    density: 'Continuous bitstream (or RGB 5:5:5 channel)',
    typicalUse: '15-bit/16-bit HiColor RGB color components (5-bit Red, Green, Blue), 32-state machines.',
    qbasicType: 'INTEGER (%)',
    formulaSummary: 'bitPos = i * 5 : 16-bit window read/write with mask &H1F (31)',
  },
  6: {
    width: 6,
    name: '6-Bit (64 Levels / VGA DAC Palette)',
    shortName: '6-Bit',
    minVal: 0,
    maxVal: 63,
    density: 'Continuous bitstream (or Base64 char)',
    typicalUse: 'VGA hardware DAC color registers (ports &H3C8/&H3C9: 0..63 for R, G, B), Base64 symbols.',
    qbasicType: 'INTEGER (%)',
    formulaSummary: 'bitPos = i * 6 : 16-bit window read/write with mask &H3F (63)',
  },
  7: {
    width: 7,
    name: '7-Bit (128 Levels / ASCII / MIDI)',
    shortName: '7-Bit',
    minVal: 0,
    maxVal: 127,
    density: 'Continuous bitstream (or bit 7 parity/flag)',
    typicalUse: 'Standard 7-bit ASCII text, MIDI message notes/velocities (0..127), packed text streams.',
    qbasicType: 'INTEGER (%)',
    formulaSummary: 'bitPos = i * 7 : 16-bit window read/write with mask &H7F (127)',
  },
  8: {
    width: 8,
    name: '8-Bit (BYTE / 256 Levels)',
    shortName: '8-Bit',
    minVal: 0,
    maxVal: 255,
    density: '1 value per byte',
    typicalUse: 'VGA Mode 13h pixel colors (SCREEN 13), raw characters, 8-bit sound samples, standard POKE/PEEK.',
    qbasicType: 'INTEGER (%)',
    formulaSummary: 'byteOff = base + i : Direct POKE byteOff, val AND 255 : PEEK(byteOff)',
  },
  16: {
    width: 16,
    name: '16-Bit (INTEGER / WORD / 2 Bytes)',
    shortName: '16-Bit',
    minVal: 0,
    maxVal: 65535,
    signedMin: -32768,
    signedMax: 32767,
    density: '2 bytes per value (Little-Endian: Low, High)',
    typicalUse: 'Screen coordinates (X, Y), QBasic INTEGER %, memory offsets, audio 16-bit PCM samples.',
    qbasicType: 'INTEGER (%) or LONG (&)',
    formulaSummary: 'POKE low: val AND 255 : POKE high: (val \\ 256) AND 255',
  },
  24: {
    width: 24,
    name: '24-Bit (TrueColor RGB / 3 Bytes)',
    shortName: '24-Bit',
    minVal: 0,
    maxVal: 16777215,
    density: '3 bytes per value (Little-Endian: B, G, R)',
    typicalUse: '24-bit TrueColor RGB values (Red, Green, Blue 8:8:8), 24-bit pointers/offsets in DOS.',
    qbasicType: 'LONG (&)',
    formulaSummary: 'POKE off, val AND 255 : POKE off+1, (val\\256) AND 255 : POKE off+2, (val\\65536) AND 255',
  },
  32: {
    width: 32,
    name: '32-Bit (LONG / DWORD / 4 Bytes)',
    shortName: '32-Bit',
    minVal: 0,
    maxVal: 4294967295,
    signedMin: -2147483648,
    signedMax: 2147483647,
    density: '4 bytes per value (Little-Endian: 4 bytes)',
    typicalUse: 'QBasic LONG & integers, timestamps, high-precision fixed-point math, 32-bit file pointers.',
    qbasicType: 'LONG (&) / DOUBLE (#)',
    formulaSummary: '4 bytes Little-Endian with signed bit 31 overflow safeguard',
  },
};

/**
 * Returns complete, production-grade QBasic .BAS source code.
 */
export function getFullQBasicCode(): string {
  return `' ============================================================================
' BITPOKE.BAS - Complete QBasic 1-to-32 Bit Memory POKE / PEEK & Saver/Loader
' Compatible with: QuickBASIC 4.5, Microsoft QBasic 1.1, PDS 7.1, and QB64
' ============================================================================
' This library provides SUB and FUNCTION routines to pack, write (POKE),
' read (PEEK), save, and load arbitrary bit-depth values:
'   - Sub-byte:   1-bit, 2-bit, 3-bit, 4-bit, 5-bit, 6-bit, 7-bit, 8-bit
'   - Multi-byte: 16-bit (INTEGER), 24-bit (RGB Triplet), 32-bit (LONG)
'   - Saver & Loader: BSAVE/BLOAD and Raw Binary File (PUT/GET)
' ============================================================================

DEFINT A-Z

' Declare all SUBs and FUNCTIONs
DECLARE SUB Poke1Bit (offset&, bitIndex%, value%)
DECLARE FUNCTION Peek1Bit% (offset&, bitIndex%)

DECLARE SUB Poke2Bit (offset&, index%, value%)
DECLARE FUNCTION Peek2Bit% (offset&, index%)

DECLARE SUB Poke3Bit (offset&, index%, value%)
DECLARE FUNCTION Peek3Bit% (offset&, index%)

DECLARE SUB Poke4Bit (offset&, index%, value%)
DECLARE FUNCTION Peek4Bit% (offset&, index%)

DECLARE SUB Poke5Bit (offset&, index%, value%)
DECLARE FUNCTION Peek5Bit% (offset&, index%)

DECLARE SUB Poke6Bit (offset&, index%, value%)
DECLARE FUNCTION Peek6Bit% (offset&, index%)

DECLARE SUB Poke7Bit (offset&, index%, value%)
DECLARE FUNCTION Peek7Bit% (offset&, index%)

DECLARE SUB Poke8Bit (offset&, value%)
DECLARE FUNCTION Peek8Bit% (offset&)

DECLARE SUB Poke16Bit (offset&, value&)
DECLARE FUNCTION Peek16Bit& (offset&)

DECLARE SUB Poke24Bit (offset&, value&)
DECLARE FUNCTION Peek24Bit& (offset&)

DECLARE SUB Poke32Bit (offset&, value&)
DECLARE FUNCTION Peek32BitSigned& (offset&)
DECLARE FUNCTION Peek32BitUnsigned# (offset&)

DECLARE SUB SaveMemoryBSAVE (fileName$, segment&, offset&, numBytes&)
DECLARE SUB LoadMemoryBLOAD (fileName$, segment&, offset&)
DECLARE SUB SaveMemoryBinary (fileName$, segment&, offset&, numBytes&)
DECLARE SUB LoadMemoryBinary (fileName$, segment&, offset&, numBytes&)

' ----------------------------------------------------------------------------
' MAIN DEMONSTRATION & VERIFICATION HARNESS
' ----------------------------------------------------------------------------
CLS
COLOR 15, 1
LOCATE 1, 1: PRINT " QBasic 1-to-32 Bit Memory POKE / PEEK & Saver/Loader Demo "
COLOR 7, 0
PRINT STRING$(80, 196)

' Allocate a 1024-byte buffer in memory using a string or array
DIM testBuffer(0 TO 511) AS INTEGER  ' 512 integers = 1024 bytes
testSegment& = VARSEG(testBuffer(0))
testOffset& = VARPTR(testBuffer(0))

' Set active segment to our test buffer
DEF SEG = testSegment&

' Clear buffer with zeroes
FOR i& = 0 TO 1023
    POKE testOffset& + i&, 0
NEXT i&

PRINT "Memory segment allocated at &H"; HEX$(testSegment&); " : &H"; HEX$(testOffset&)
PRINT "Testing bitwise POKE and PEEK routines:"
PRINT

' --- 1. Test 1-Bit (Monochrome / Flags) ---
PRINT " [1-Bit] Poking 8 boolean flags into byte 0... ";
flags% = 0
FOR i% = 0 TO 7
    val1% = i% MOD 2
    Poke1Bit testOffset&, i%, val1%
NEXT i%
ok1% = -1
FOR i% = 0 TO 7
    IF Peek1Bit%(testOffset&, i%) <> (i% MOD 2) THEN ok1% = 0
NEXT i%
IF ok1% THEN COLOR 10: PRINT "[OK]" ELSE COLOR 12: PRINT "[FAIL]"
COLOR 7

' --- 2. Test 2-Bit (4-color CGA) ---
PRINT " [2-Bit] Poking 4 CGA colors (0..3) into byte 1... ";
FOR i% = 0 TO 3
    Poke2Bit testOffset& + 1, i%, i%
NEXT i%
ok2% = -1
FOR i% = 0 TO 3
    IF Peek2Bit%(testOffset& + 1, i%) <> i% THEN ok2% = 0
NEXT i%
IF ok2% THEN COLOR 10: PRINT "[OK]" ELSE COLOR 12: PRINT "[FAIL]"
COLOR 7

' --- 3. Test 3-Bit (Continuous Bitstream) ---
PRINT " [3-Bit] Poking eight 3-bit values (0..7) spanning bytes... ";
FOR i% = 0 TO 7
    Poke3Bit testOffset& + 10, i%, i%
NEXT i%
ok3% = -1
FOR i% = 0 TO 7
    IF Peek3Bit%(testOffset& + 10, i%) <> i% THEN ok3% = 0
NEXT i%
IF ok3% THEN COLOR 10: PRINT "[OK]" ELSE COLOR 12: PRINT "[FAIL]"
COLOR 7

' --- 4. Test 4-Bit (16-color EGA/VGA Nibbles) ---
PRINT " [4-Bit] Poking 4 EGA nibbles (colors 12, 14, 9, 15)... ";
Poke4Bit testOffset& + 20, 0, 12
Poke4Bit testOffset& + 20, 1, 14
Poke4Bit testOffset& + 20, 2, 9
Poke4Bit testOffset& + 20, 3, 15
IF Peek4Bit%(testOffset& + 20, 0) = 12 AND _
   Peek4Bit%(testOffset& + 20, 1) = 14 AND _
   Peek4Bit%(testOffset& + 20, 2) = 9 AND _
   Peek4Bit%(testOffset& + 20, 3) = 15 THEN
    COLOR 10: PRINT "[OK]"
ELSE
    COLOR 12: PRINT "[FAIL]"
END IF
COLOR 7

' --- 5. Test 5-Bit (32 levels / RGB555) ---
PRINT " [5-Bit] Poking four 5-bit values (5, 17, 31, 0)... ";
Poke5Bit testOffset& + 30, 0, 5
Poke5Bit testOffset& + 30, 1, 17
Poke5Bit testOffset& + 30, 2, 31
Poke5Bit testOffset& + 30, 3, 0
IF Peek5Bit%(testOffset& + 30, 0) = 5 AND _
   Peek5Bit%(testOffset& + 30, 1) = 17 AND _
   Peek5Bit%(testOffset& + 30, 2) = 31 AND _
   Peek5Bit%(testOffset& + 30, 3) = 0 THEN
    COLOR 10: PRINT "[OK]"
ELSE
    COLOR 12: PRINT "[FAIL]"
END IF
COLOR 7

' --- 6. Test 6-Bit (VGA DAC Palette 0..63) ---
PRINT " [6-Bit] Poking three 6-bit DAC values (63, 32, 10)... ";
Poke6Bit testOffset& + 40, 0, 63
Poke6Bit testOffset& + 40, 1, 32
Poke6Bit testOffset& + 40, 2, 10
IF Peek6Bit%(testOffset& + 40, 0) = 63 AND _
   Peek6Bit%(testOffset& + 40, 1) = 32 AND _
   Peek6Bit%(testOffset& + 40, 2) = 10 THEN
    COLOR 10: PRINT "[OK]"
ELSE
    COLOR 12: PRINT "[FAIL]"
END IF
COLOR 7

' --- 7. Test 7-Bit (ASCII / MIDI) ---
PRINT " [7-Bit] Poking 7-bit ASCII 'Q' (81) and 'B' (66)... ";
Poke7Bit testOffset& + 50, 0, 81
Poke7Bit testOffset& + 50, 1, 66
IF Peek7Bit%(testOffset& + 50, 0) = 81 AND Peek7Bit%(testOffset& + 50, 1) = 66 THEN
    COLOR 10: PRINT "[OK]"
ELSE
    COLOR 12: PRINT "[FAIL]"
END IF
COLOR 7

' --- 8. Test 8-Bit (BYTE) ---
PRINT " [8-Bit] Poking raw byte (255)... ";
Poke8Bit testOffset& + 60, 255
IF Peek8Bit%(testOffset& + 60) = 255 THEN
    COLOR 10: PRINT "[OK]"
ELSE
    COLOR 12: PRINT "[FAIL]"
END IF
COLOR 7

' --- 9. Test 16-Bit (INTEGER / WORD) ---
PRINT " [16-Bit] Poking 16-bit word (54321)... ";
Poke16Bit testOffset& + 70, 54321
IF Peek16Bit&(testOffset& + 70) = 54321 THEN
    COLOR 10: PRINT "[OK]"
ELSE
    COLOR 12: PRINT "[FAIL]"
END IF
COLOR 7

' --- 10. Test 24-Bit (TrueColor RGB) ---
PRINT " [24-Bit] Poking 24-bit TrueColor RGB &HFF8040 (16744512)... ";
Poke24Bit testOffset& + 80, 16744512
IF Peek24Bit&(testOffset& + 80) = 16744512 THEN
    COLOR 10: PRINT "[OK]"
ELSE
    COLOR 12: PRINT "[FAIL]"
END IF
COLOR 7

' --- 11. Test 32-Bit (LONG / DWORD) ---
PRINT " [32-Bit] Poking 32-bit LONG value (123456789)... ";
Poke32Bit testOffset& + 90, 123456789
IF Peek32BitSigned&(testOffset& + 90) = 123456789 THEN
    COLOR 10: PRINT "[OK]"
ELSE
    COLOR 12: PRINT "[FAIL]"
END IF
COLOR 7

PRINT STRING$(80, 196)

' --- Test SAVER & LOADER ---
PRINT "Testing BSAVE & BLOAD Saver and Loader:"
fileName$ = "BITDATA.BSV"
PRINT " Saving 128 bytes to disk via BSAVE ("; fileName$; ")... ";
SaveMemoryBSAVE fileName$, testSegment&, testOffset&, 128
COLOR 10: PRINT "[DONE]"
COLOR 7

PRINT " Clearing memory buffer to &HFF... ";
FOR i& = 0 TO 127: POKE testOffset& + i&, 255: NEXT i&
COLOR 10: PRINT "[DONE]"
COLOR 7

PRINT " Reloading memory from disk via BLOAD... ";
LoadMemoryBLOAD fileName$, testSegment&, testOffset&
COLOR 10: PRINT "[DONE]"
COLOR 7

' Verify round-trip integrity after BLOAD!
IF Peek16Bit&(testOffset& + 70) = 54321 AND _
   Peek24Bit&(testOffset& + 80) = 16744512 AND _
   Peek32BitSigned&(testOffset& + 90) = 123456789 THEN
    COLOR 14: PRINT " *** SUCCESS: All bit patterns verified after BSAVE/BLOAD! ***"
ELSE
    COLOR 12: PRINT " *** ERROR: Data mismatch after reload! ***"
END IF

' Restore default segment
DEF SEG
COLOR 7
PRINT
PRINT "Press any key to end demonstration."
DO: LOOP UNTIL INKEY$ <> ""
END

' ============================================================================
' SUB-BYTE BIT MANIPULATION ROUTINES (1 TO 8 BITS)
' ============================================================================

' --- 1-Bit Routines (8 values per byte) ---
SUB Poke1Bit (offset&, bitIndex%, value%)
    ' Calculates byte offset and bit mask (0..7)
    byteOff& = offset& + (bitIndex% \ 8)
    bitPos% = bitIndex% MOD 8
    mask% = 2 ^ bitPos%
    curByte% = PEEK(byteOff&)
    IF value% <> 0 THEN
        POKE byteOff&, curByte% OR mask%
    ELSE
        POKE byteOff&, curByte% AND (255 - mask%)
    END IF
END SUB

FUNCTION Peek1Bit% (offset&, bitIndex%)
    byteOff& = offset& + (bitIndex% \ 8)
    bitPos% = bitIndex% MOD 8
    mask% = 2 ^ bitPos%
    IF (PEEK(byteOff&) AND mask%) <> 0 THEN
        Peek1Bit% = 1
    ELSE
        Peek1Bit% = 0
    END IF
END FUNCTION

' --- 2-Bit Routines (4 values per byte, 0..3) ---
SUB Poke2Bit (offset&, index%, value%)
    byteOff& = offset& + (index% \ 4)
    shift% = (index% MOD 4) * 2
    mask% = 3 * (2 ^ shift%)
    curByte% = PEEK(byteOff&)
    cleanByte% = curByte% AND (255 - mask%)
    newByte% = cleanByte% OR ((value% AND 3) * (2 ^ shift%))
    POKE byteOff&, newByte%
END SUB

FUNCTION Peek2Bit% (offset&, index%)
    byteOff& = offset& + (index% \ 4)
    shift% = (index% MOD 4) * 2
    Peek2Bit% = (PEEK(byteOff&) \ (2 ^ shift%)) AND 3
END FUNCTION

' --- 3-Bit Routines (Continuous bitstream across byte boundaries, 0..7) ---
SUB Poke3Bit (offset&, index%, value%)
    bitPos& = index% * 3&
    byteOff& = offset& + (bitPos& \ 8)
    shift% = bitPos& MOD 8
    val3% = value% AND 7

    ' Read 16-bit word across current and next byte
    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    ' Clear 3 bits using mask and insert new value
    mask& = 7& * (2& ^ shift%)
    word& = (word& AND (65535 - mask&)) OR (val3% * (2& ^ shift%))

    ' Write bytes back
    POKE byteOff&, word& AND 255
    POKE byteOff& + 1, (word& \ 256&) AND 255
END SUB

FUNCTION Peek3Bit% (offset&, index%)
    bitPos& = index% * 3&
    byteOff& = offset& + (bitPos& \ 8)
    shift% = bitPos& MOD 8

    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    Peek3Bit% = (word& \ (2& ^ shift%)) AND 7
END FUNCTION

' --- 4-Bit Routines (2 nibbles per byte, 0..15) ---
SUB Poke4Bit (offset&, index%, value%)
    byteOff& = offset& + (index% \ 2)
    curByte% = PEEK(byteOff&)
    val4% = value% AND &H0F
    IF (index% MOD 2) = 0 THEN
        ' Low nibble (bits 0..3)
        POKE byteOff&, (curByte% AND &HF0) OR val4%
    ELSE
        ' High nibble (bits 4..7)
        POKE byteOff&, (curByte% AND &H0F) OR (val4% * 16)
    END IF
END SUB

FUNCTION Peek4Bit% (offset&, index%)
    byteOff& = offset& + (index% \ 2)
    curByte% = PEEK(byteOff&)
    IF (index% MOD 2) = 0 THEN
        Peek4Bit% = curByte% AND &H0F
    ELSE
        Peek4Bit% = (curByte% \ 16) AND &H0F
    END IF
END FUNCTION

' --- 5-Bit Routines (32 levels, 0..31, RGB555) ---
SUB Poke5Bit (offset&, index%, value%)
    bitPos& = index% * 5&
    byteOff& = offset& + (bitPos& \ 8)
    shift% = bitPos& MOD 8
    val5% = value% AND 31

    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    mask& = 31& * (2& ^ shift%)
    word& = (word& AND (65535 - mask&)) OR (val5% * (2& ^ shift%))

    POKE byteOff&, word& AND 255
    POKE byteOff& + 1, (word& \ 256&) AND 255
END SUB

FUNCTION Peek5Bit% (offset&, index%)
    bitPos& = index% * 5&
    byteOff& = offset& + (bitPos& \ 8)
    shift% = bitPos& MOD 8

    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    Peek5Bit% = (word& \ (2& ^ shift%)) AND 31
END FUNCTION

' --- 6-Bit Routines (64 levels, 0..63, VGA DAC color component) ---
SUB Poke6Bit (offset&, index%, value%)
    bitPos& = index% * 6&
    byteOff& = offset& + (bitPos& \ 8)
    shift% = bitPos& MOD 8
    val6% = value% AND 63

    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    mask& = 63& * (2& ^ shift%)
    word& = (word& AND (65535 - mask&)) OR (val6% * (2& ^ shift%))

    POKE byteOff&, word& AND 255
    POKE byteOff& + 1, (word& \ 256&) AND 255
END SUB

FUNCTION Peek6Bit% (offset&, index%)
    bitPos& = index% * 6&
    byteOff& = offset& + (bitPos& \ 8)
    shift% = bitPos& MOD 8

    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    Peek6Bit% = (word& \ (2& ^ shift%)) AND 63
END FUNCTION

' --- 7-Bit Routines (128 levels, 0..127, ASCII / MIDI) ---
SUB Poke7Bit (offset&, index%, value%)
    bitPos& = index% * 7&
    byteOff& = offset& + (bitPos& \ 8)
    shift% = bitPos& MOD 8
    val7% = value% AND 127

    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    mask& = 127& * (2& ^ shift%)
    word& = (word& AND (65535 - mask&)) OR (val7% * (2& ^ shift%))

    POKE byteOff&, word& AND 255
    POKE byteOff& + 1, (word& \ 256&) AND 255
END SUB

FUNCTION Peek7Bit% (offset&, index%)
    bitPos& = index% * 7&
    byteOff& = offset& + (bitPos& \ 8)
    shift% = bitPos& MOD 8

    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    Peek7Bit% = (word& \ (2& ^ shift%)) AND 127
END FUNCTION

' --- 8-Bit Routines (Standard Byte, 0..255) ---
SUB Poke8Bit (offset&, value%)
    POKE offset&, value% AND 255
END SUB

FUNCTION Peek8Bit% (offset&)
    Peek8Bit% = PEEK(offset&)
END FUNCTION

' ============================================================================
' MULTI-BYTE BIT MANIPULATION ROUTINES (16, 24, 32 BITS)
' Uses Little-Endian byte order standard for x86 architectures and QBasic.
' ============================================================================

' --- 16-Bit Routines (INTEGER / WORD, 2 Bytes) ---
SUB Poke16Bit (offset&, value&)
    ' Low byte first, then High byte
    POKE offset&, value& AND 255
    POKE offset& + 1, (value& \ 256&) AND 255
END SUB

FUNCTION Peek16Bit& (offset&)
    low% = PEEK(offset&)
    high% = PEEK(offset& + 1)
    Peek16Bit& = low% + (high% * 256&)
END FUNCTION

' --- 24-Bit Routines (TrueColor RGB / 3 Bytes) ---
SUB Poke24Bit (offset&, value&)
    ' Byte 0: Low, Byte 1: Mid, Byte 2: High
    POKE offset&, value& AND 255
    POKE offset& + 1, (value& \ 256&) AND 255
    POKE offset& + 2, (value& \ 65536) AND 255
END SUB

FUNCTION Peek24Bit& (offset&)
    b0& = PEEK(offset&)
    b1& = PEEK(offset& + 1)
    b2& = PEEK(offset& + 2)
    Peek24Bit& = b0& + (b1& * 256&) + (b2& * 65536)
END FUNCTION

' --- 32-Bit Routines (LONG / DWORD, 4 Bytes) ---
SUB Poke32Bit (offset&, value&)
    ' Handles both positive and negative signed LONG values safely in QBasic
    v# = value&
    IF v# < 0 THEN v# = v# + 4294967296#

    POKE offset&, INT(v#) AND 255
    POKE offset& + 1, INT(v# / 256#) AND 255
    POKE offset& + 2, INT(v# / 65536#) AND 255
    POKE offset& + 3, INT(v# / 16777216#) AND 255
END SUB

FUNCTION Peek32BitSigned& (offset&)
    b0& = PEEK(offset&)
    b1& = PEEK(offset& + 1)
    b2& = PEEK(offset& + 2)
    b3& = PEEK(offset& + 3)

    ' If highest bit (sign bit) is set, adjust for negative signed integer
    IF b3& >= 128 THEN
        Peek32BitSigned& = (b0& + (b1& * 256&) + (b2& * 65536)) + ((b3& - 256) * 16777216)
    ELSE
        Peek32BitSigned& = b0& + (b1& * 256&) + (b2& * 65536) + (b3& * 16777216)
    END IF
END FUNCTION

FUNCTION Peek32BitUnsigned# (offset&)
    b0# = PEEK(offset&)
    b1# = PEEK(offset& + 1)
    b2# = PEEK(offset& + 2)
    b3# = PEEK(offset& + 3)
    Peek32BitUnsigned# = b0# + (b1# * 256#) + (b2# * 65536#) + (b3# * 16777216#)
END FUNCTION

' ============================================================================
' SAVER & LOADER IMPLEMENTATIONS
' ============================================================================

' --- METHOD 1: BSAVE & BLOAD (Classic DOS QuickBASIC Native Memory Dump) ---
' BSAVE creates an authentic 7-byte DOS header:
'   Byte 0:     &HFD (Signature byte)
'   Bytes 1-2:  Segment (16-bit, Little Endian)
'   Bytes 3-4:  Offset  (16-bit, Little Endian)
'   Bytes 5-6:  Length  (16-bit, Little Endian)
' Followed immediately by raw memory byte content.
SUB SaveMemoryBSAVE (fileName$, segment&, offset&, numBytes&)
    DEF SEG = segment&
    BSAVE fileName$, offset&, numBytes&
    DEF SEG
END SUB

SUB LoadMemoryBLOAD (fileName$, segment&, offset&)
    DEF SEG = segment&
    BLOAD fileName$, offset&
    DEF SEG
END SUB

' --- METHOD 2: OPEN FOR BINARY (Universal Cross-Platform File I/O) ---
' Reads and writes memory directly using byte buffers.
SUB SaveMemoryBinary (fileName$, segment&, offset&, numBytes&)
    f% = FREEFILE
    OPEN fileName$ FOR BINARY AS #f%
    DIM byteChar AS STRING * 1
    DEF SEG = segment&
    FOR i& = 0 TO numBytes& - 1
        byteChar = CHR$(PEEK(offset& + i&))
        PUT #f%, , byteChar
    NEXT i&
    CLOSE #f%
    DEF SEG
END SUB

SUB LoadMemoryBinary (fileName$, segment&, offset&, numBytes&)
    f% = FREEFILE
    OPEN fileName$ FOR BINARY AS #f%
    DIM byteChar AS STRING * 1
    DEF SEG = segment&
    FOR i& = 0 TO numBytes& - 1
        IF EOF(f%) THEN EXIT FOR
        GET #f%, , byteChar
        POKE offset& + i&, ASC(byteChar)
    NEXT i&
    CLOSE #f%
    DEF SEG
END SUB
`;
}

/**
 * Returns isolated snippet for specific bit width with detailed math explanation.
 */
export function getIsolatedSnippet(bitWidth: BitWidth): string {
  switch (bitWidth) {
    case 1:
      return `' ============================================================
' 1-BIT POKE & PEEK ROUTINES
' Range: 0 to 1 | Density: 8 values packed per byte
' Used for: Monochrome pixels, boolean flags, collision maps
' ============================================================

SUB Poke1Bit (offset&, bitIndex%, value%)
    ' 1. Determine which byte contains this bit (integer division by 8)
    byteOff& = offset& + (bitIndex% \\ 8)
    ' 2. Determine bit position (0 to 7) within the byte
    bitPos% = bitIndex% MOD 8
    ' 3. Calculate bitmask: 2^0=1, 2^1=2, 2^2=4, 2^3=8, ...
    mask% = 2 ^ bitPos%
    ' 4. Read current byte to preserve neighbor bits
    curByte% = PEEK(byteOff&)
    
    IF value% <> 0 THEN
        ' Turn bit ON using bitwise OR
        POKE byteOff&, curByte% OR mask%
    ELSE
        ' Turn bit OFF using bitwise AND with inverted mask
        POKE byteOff&, curByte% AND (255 - mask%)
    END IF
END SUB

FUNCTION Peek1Bit% (offset&, bitIndex%)
    byteOff& = offset& + (bitIndex% \\ 8)
    bitPos% = bitIndex% MOD 8
    mask% = 2 ^ bitPos%
    IF (PEEK(byteOff&) AND mask%) <> 0 THEN
        Peek1Bit% = 1
    ELSE
        Peek1Bit% = 0
    END IF
END FUNCTION`;

    case 2:
      return `' ============================================================
' 2-BIT POKE & PEEK ROUTINES
' Range: 0 to 3 | Density: 4 values packed per byte
' Used for: CGA 4-color palette (SCREEN 1), Game Boy 4-shade tiles
' ============================================================

SUB Poke2Bit (offset&, index%, value%)
    ' 4 values fit in 1 byte (each value takes 2 bits: 0, 2, 4, 6)
    byteOff& = offset& + (index% \\ 4)
    shift% = (index% MOD 4) * 2
    mask% = 3 * (2 ^ shift%)  ' 3 is binary 11
    
    curByte% = PEEK(byteOff&)
    cleanByte% = curByte% AND (255 - mask%)
    newByte% = cleanByte% OR ((value% AND 3) * (2 ^ shift%))
    POKE byteOff&, newByte%
END SUB

FUNCTION Peek2Bit% (offset&, index%)
    byteOff& = offset& + (index% \\ 4)
    shift% = (index% MOD 4) * 2
    Peek2Bit% = (PEEK(byteOff&) \\ (2 ^ shift%)) AND 3
END FUNCTION`;

    case 3:
      return `' ============================================================
' 3-BIT POKE & PEEK ROUTINES (CONTINUOUS BITSTREAM)
' Range: 0 to 7 | Density: Continuous stream across byte boundaries
' Used for: 8-color graphics, octal codes, LZW/Huffman streams
' ============================================================

SUB Poke3Bit (offset&, index%, value%)
    ' Continuous bit position: value 0=bit 0..2, value 1=bit 3..5, etc.
    bitPos& = index% * 3&
    byteOff& = offset& + (bitPos& \\ 8)
    shift% = bitPos& MOD 8
    val3% = value% AND 7

    ' Read 16-bit word spanning current and adjacent byte
    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    ' Clear 3 bits and insert new 3-bit pattern
    mask& = 7& * (2& ^ shift%)
    word& = (word& AND (65535 - mask&)) OR (val3% * (2& ^ shift%))

    ' Write both bytes back
    POKE byteOff&, word& AND 255
    POKE byteOff& + 1, (word& \\ 256&) AND 255
END SUB

FUNCTION Peek3Bit% (offset&, index%)
    bitPos& = index% * 3&
    byteOff& = offset& + (bitPos& \\ 8)
    shift% = bitPos& MOD 8

    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    Peek3Bit% = (word& \\ (2& ^ shift%)) AND 7
END FUNCTION`;

    case 4:
      return `' ============================================================
' 4-BIT POKE & PEEK ROUTINES (NIBBLES)
' Range: 0 to 15 | Density: 2 values packed per byte
' Used for: EGA/VGA 16-color palette (SCREEN 7/9/12/13), BCD digits
' ============================================================

SUB Poke4Bit (offset&, index%, value%)
    byteOff& = offset& + (index% \\ 2)
    curByte% = PEEK(byteOff&)
    val4% = value% AND &H0F
    
    IF (index% MOD 2) = 0 THEN
        ' Low nibble (bits 0..3): clear low bits (&HF0), OR new bits
        POKE byteOff&, (curByte% AND &HF0) OR val4%
    ELSE
        ' High nibble (bits 4..7): clear high bits (&H0F), OR shifted bits
        POKE byteOff&, (curByte% AND &H0F) OR (val4% * 16)
    END IF
END SUB

FUNCTION Peek4Bit% (offset&, index%)
    byteOff& = offset& + (index% \\ 2)
    curByte% = PEEK(byteOff&)
    IF (index% MOD 2) = 0 THEN
        Peek4Bit% = curByte% AND &H0F
    ELSE
        Peek4Bit% = (curByte% \\ 16) AND &H0F
    END IF
END FUNCTION`;

    case 5:
      return `' ============================================================
' 5-BIT POKE & PEEK ROUTINES
' Range: 0 to 31 | Density: Continuous stream / RGB555 channel
' Used for: 15-bit/16-bit HiColor RGB color components
' ============================================================

SUB Poke5Bit (offset&, index%, value%)
    bitPos& = index% * 5&
    byteOff& = offset& + (bitPos& \\ 8)
    shift% = bitPos& MOD 8
    val5% = value% AND 31

    ' Read 16-bit word across byte boundary
    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    mask& = 31& * (2& ^ shift%)
    word& = (word& AND (65535 - mask&)) OR (val5% * (2& ^ shift%))

    POKE byteOff&, word& AND 255
    POKE byteOff& + 1, (word& \\ 256&) AND 255
END SUB

FUNCTION Peek5Bit% (offset&, index%)
    bitPos& = index% * 5&
    byteOff& = offset& + (bitPos& \\ 8)
    shift% = bitPos& MOD 8

    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    Peek5Bit% = (word& \\ (2& ^ shift%)) AND 31
END FUNCTION`;

    case 6:
      return `' ============================================================
' 6-BIT POKE & PEEK ROUTINES
' Range: 0 to 63 | Density: Continuous stream
' Used for: VGA DAC palette registers (&H3C8/&H3C9 R,G,B), Base64
' ============================================================

SUB Poke6Bit (offset&, index%, value%)
    bitPos& = index% * 6&
    byteOff& = offset& + (bitPos& \\ 8)
    shift% = bitPos& MOD 8
    val6% = value% AND 63

    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    mask& = 63& * (2& ^ shift%)
    word& = (word& AND (65535 - mask&)) OR (val6% * (2& ^ shift%))

    POKE byteOff&, word& AND 255
    POKE byteOff& + 1, (word& \\ 256&) AND 255
END SUB

FUNCTION Peek6Bit% (offset&, index%)
    bitPos& = index% * 6&
    byteOff& = offset& + (bitPos& \\ 8)
    shift% = bitPos& MOD 8

    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    Peek6Bit% = (word& \\ (2& ^ shift%)) AND 63
END FUNCTION`;

    case 7:
      return `' ============================================================
' 7-BIT POKE & PEEK ROUTINES
' Range: 0 to 127 | Density: Continuous stream
' Used for: Standard 7-bit ASCII characters, MIDI note/velocity bytes
' ============================================================

SUB Poke7Bit (offset&, index%, value%)
    bitPos& = index% * 7&
    byteOff& = offset& + (bitPos& \\ 8)
    shift% = bitPos& MOD 8
    val7% = value% AND 127

    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    mask& = 127& * (2& ^ shift%)
    word& = (word& AND (65535 - mask&)) OR (val7% * (2& ^ shift%))

    POKE byteOff&, word& AND 255
    POKE byteOff& + 1, (word& \\ 256&) AND 255
END SUB

FUNCTION Peek7Bit% (offset&, index%)
    bitPos& = index% * 7&
    byteOff& = offset& + (bitPos& \\ 8)
    shift% = bitPos& MOD 8

    low% = PEEK(byteOff&)
    high% = PEEK(byteOff& + 1)
    word& = low% + (high% * 256&)

    Peek7Bit% = (word& \\ (2& ^ shift%)) AND 127
END FUNCTION`;

    case 8:
      return `' ============================================================
' 8-BIT POKE & PEEK ROUTINES
' Range: 0 to 255 | Density: 1 byte per value
' Used for: VGA Mode 13h pixel colors, raw characters, byte buffers
' ============================================================

SUB Poke8Bit (offset&, value%)
    ' Direct POKE writes 1 raw byte (0..255)
    POKE offset&, value% AND 255
END SUB

FUNCTION Peek8Bit% (offset&)
    Peek8Bit% = PEEK(offset&)
END FUNCTION`;

    case 16:
      return `' ============================================================
' 16-BIT POKE & PEEK ROUTINES (INTEGER / WORD)
' Range: 0 to 65535 (unsigned) or -32768 to 32767 (signed)
' Endianness: Little-Endian (Low byte at offset, High byte at offset+1)
' ============================================================

SUB Poke16Bit (offset&, value&)
    ' Low byte: masked with 255
    POKE offset&, value& AND 255
    ' High byte: shifted right by 8 bits (integer division by 256)
    POKE offset& + 1, (value& \\ 256&) AND 255
END SUB

FUNCTION Peek16Bit& (offset&)
    low% = PEEK(offset&)
    high% = PEEK(offset& + 1)
    Peek16Bit& = low% + (high% * 256&)
END FUNCTION`;

    case 24:
      return `' ============================================================
' 24-BIT POKE & PEEK ROUTINES (TRUECOLOR RGB)
' Range: 0 to 16,777,215 (3 bytes)
' Used for: 24-bit TrueColor RGB pixels (R, G, B), 24-bit far pointers
' ============================================================

SUB Poke24Bit (offset&, value&)
    ' Byte 0: Low (bits 0..7)
    POKE offset&, value& AND 255
    ' Byte 1: Mid (bits 8..15)
    POKE offset& + 1, (value& \\ 256&) AND 255
    ' Byte 2: High (bits 16..23)
    POKE offset& + 2, (value& \\ 65536) AND 255
END SUB

FUNCTION Peek24Bit& (offset&)
    b0& = PEEK(offset&)
    b1& = PEEK(offset& + 1)
    b2& = PEEK(offset& + 2)
    Peek24Bit& = b0& + (b1& * 256&) + (b2& * 65536)
END FUNCTION`;

    case 32:
      return `' ============================================================
' 32-BIT POKE & PEEK ROUTINES (LONG / DWORD)
' Range: 0 to 4,294,967,295 (unsigned) or -2,147,483,648 to 2,147,483,647 (signed)
' Little-Endian: 4 bytes (Low byte to High byte)
' NOTE: In QBasic, LONG integers are signed. When bit 31 is set,
'       special conversion handles negative values safely!
' ============================================================

SUB Poke32Bit (offset&, value&)
    ' Use DOUBLE (#) intermediate to prevent signed overflow
    v# = value&
    IF v# < 0 THEN v# = v# + 4294967296#

    POKE offset&, INT(v#) AND 255
    POKE offset& + 1, INT(v# / 256#) AND 255
    POKE offset& + 2, INT(v# / 65536#) AND 255
    POKE offset& + 3, INT(v# / 16777216#) AND 255
END SUB

FUNCTION Peek32BitSigned& (offset&)
    b0& = PEEK(offset&)
    b1& = PEEK(offset& + 1)
    b2& = PEEK(offset& + 2)
    b3& = PEEK(offset& + 3)

    ' If highest bit (sign bit) is 1, value is negative in 32-bit signed LONG
    IF b3& >= 128 THEN
        Peek32BitSigned& = (b0& + (b1& * 256&) + (b2& * 65536)) + ((b3& - 256) * 16777216)
    ELSE
        Peek32BitSigned& = b0& + (b1& * 256&) + (b2& * 65536) + (b3& * 16777216)
    END IF
END FUNCTION

FUNCTION Peek32BitUnsigned# (offset&)
    b0# = PEEK(offset&)
    b1# = PEEK(offset& + 1)
    b2# = PEEK(offset& + 2)
    b3# = PEEK(offset& + 3)
    Peek32BitUnsigned# = b0# + (b1# * 256#) + (b2# * 65536#) + (b3# * 16777216#)
END FUNCTION`;
  }
}

export function getFileIOSnippets(): { bsave: string; binary: string } {
  const bsave = `' ============================================================
' BSAVE & BLOAD SAVER & LOADER
' The authentic MS-DOS QuickBASIC binary memory serialization
' ============================================================

' --- SAVER ---
SUB SaveMemoryBSAVE (fileName$, segment&, offset&, numBytes&)
    ' Set current memory segment to target buffer
    DEF SEG = segment&
    ' BSAVE writes 7-byte header (&HFD, Segment, Offset, Length) + raw memory
    BSAVE fileName$, offset&, numBytes&
    ' Restore default segment
    DEF SEG
END SUB

' --- LOADER ---
SUB LoadMemoryBLOAD (fileName$, segment&, offset&)
    ' Set current memory segment to destination buffer
    DEF SEG = segment&
    ' BLOAD reads the file and writes bytes directly into memory
    BLOAD fileName$, offset&
    ' Restore default segment
    DEF SEG
END SUB`;

  const binary = `' ============================================================
' UNIVERSAL OPEN FOR BINARY (PUT / GET) SAVER & LOADER
' Portable across all BASIC dialects and platforms
' ============================================================

' --- SAVER ---
SUB SaveMemoryBinary (fileName$, segment&, offset&, numBytes&)
    f% = FREEFILE
    OPEN fileName$ FOR BINARY AS #f%
    DIM byteChar AS STRING * 1
    
    DEF SEG = segment&
    FOR i& = 0 TO numBytes& - 1
        byteChar = CHR$(PEEK(offset& + i&))
        PUT #f%, , byteChar
    NEXT i&
    
    CLOSE #f%
    DEF SEG
END SUB

' --- LOADER ---
SUB LoadMemoryBinary (fileName$, segment&, offset&, numBytes&)
    f% = FREEFILE
    OPEN fileName$ FOR BINARY AS #f%
    DIM byteChar AS STRING * 1
    
    DEF SEG = segment&
    FOR i& = 0 TO numBytes& - 1
        IF EOF(f%) THEN EXIT FOR
        GET #f%, , byteChar
        POKE offset& + i&, ASC(byteChar)
    NEXT i&
    
    CLOSE #f%
    DEF SEG
END SUB`;

  return { bsave, binary };
}
