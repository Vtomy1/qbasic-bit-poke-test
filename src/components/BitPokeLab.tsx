import React, { useState, useEffect } from 'react';
import { BitOperationTrace, BitWidth } from '../types/qbasic';
import { BIT_METADATA } from '../utils/qbasicCode';
import { pokeValue, peekValue } from '../utils/bitEngine';
import { Play, ArrowRight, Zap, CheckCircle2, Sliders, Layers, Eye } from 'lucide-react';

interface BitPokeLabProps {
  memory: Uint8Array;
  setMemory: React.Dispatch<React.SetStateAction<Uint8Array>>;
  baseOffset: number;
  segment: number;
  onTraceUpdate: (trace: BitOperationTrace) => void;
  activeTrace: BitOperationTrace | null;
}

const BIT_WIDTH_OPTIONS: BitWidth[] = [1, 2, 3, 4, 5, 6, 7, 8, 16, 24, 32];

// Authentic CGA 4-color palette (Palette 1: Black, Cyan, Magenta, White)
const CGA_PALETTE = ['#000000', '#55ffff', '#ff55ff', '#ffffff'];

// Authentic EGA/VGA 16-color palette
const EGA_PALETTE = [
  '#000000', // 0: Black
  '#0000aa', // 1: Blue
  '#00aa00', // 2: Green
  '#00aaaa', // 3: Cyan
  '#aa0000', // 4: Red
  '#aa00aa', // 5: Magenta
  '#aa5500', // 6: Brown
  '#aaaaaa', // 7: Light Gray
  '#555555', // 8: Dark Gray
  '#5555ff', // 9: Light Blue
  '#55ff55', // 10: Light Green
  '#55ffff', // 11: Light Cyan
  '#ff5555', // 12: Light Red
  '#ff55ff', // 13: Light Magenta
  '#ffff55', // 14: Yellow
  '#ffffff', // 15: Bright White
];

export const BitPokeLab: React.FC<BitPokeLabProps> = ({
  memory,
  setMemory,
  baseOffset,
  segment,
  onTraceUpdate,
  activeTrace,
}) => {
  const [selectedBitWidth, setSelectedBitWidth] = useState<BitWidth>(4);
  const [itemIndex, setItemIndex] = useState<number>(0);
  const [inputValue, setInputValue] = useState<number>(14); // default yellow (14) in 4-bit
  const [lastPeekedValue, setLastPeekedValue] = useState<number | null>(null);
  const [isMatch, setIsMatch] = useState<boolean | null>(null);

  const meta = BIT_METADATA[selectedBitWidth];

  // Adjust input value when bit width changes
  useEffect(() => {
    if (inputValue > meta.maxVal) {
      setInputValue(meta.maxVal);
    }
  }, [selectedBitWidth, meta.maxVal]);

  const handlePoke = () => {
    const { newMem, trace } = pokeValue(
      memory,
      baseOffset,
      selectedBitWidth,
      itemIndex,
      inputValue
    );
    setMemory(newMem);
    onTraceUpdate(trace);

    // Automatically verify peek
    const peeked = peekValue(newMem, baseOffset, selectedBitWidth, itemIndex);
    setLastPeekedValue(peeked);
    setIsMatch(peeked === (selectedBitWidth === 32 ? (inputValue >>> 0) : inputValue));
  };

  const handlePeek = () => {
    const peeked = peekValue(memory, baseOffset, selectedBitWidth, itemIndex);
    setLastPeekedValue(peeked);
    setIsMatch(peeked === (selectedBitWidth === 32 ? (inputValue >>> 0) : inputValue));
  };

  const handleFillSequence = () => {
    let curMem: Uint8Array = new Uint8Array(memory.length);
    curMem.set(memory);
    let lastTrace: BitOperationTrace | null = null;
    const count = selectedBitWidth <= 4 ? 16 : selectedBitWidth <= 8 ? 8 : 4;

    for (let i = 0; i < count; i++) {
      const val = meta.maxVal > 0 ? (i * Math.floor(meta.maxVal / (count - 1 || 1))) % (meta.maxVal + 1) : 0;
      const res = pokeValue(curMem, baseOffset, selectedBitWidth, i, val);
      curMem = res.newMem;
      lastTrace = res.trace;
    }
    setMemory(curMem);
    if (lastTrace) onTraceUpdate(lastTrace);
  };

  return (
    <div className="space-y-4 font-mono text-white">
      {/* 1. Bit Width Selector Grid */}
      <div className="bg-[#000080]/90 border border-blue-600/70 rounded-md p-3 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1.5 border-b border-blue-500/30">
          <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            SELECT BIT-WIDTH (1-BIT TO 32-BIT)
          </span>
          <span className="text-[11px] text-blue-200">
            Click any bit width to inspect and POKE/PEEK:
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-1.5">
          {BIT_WIDTH_OPTIONS.map((bw) => {
            const isSelected = selectedBitWidth === bw;
            const itemMeta = BIT_METADATA[bw];
            return (
              <button
                key={bw}
                onClick={() => {
                  setSelectedBitWidth(bw);
                  // Provide meaningful preset defaults
                  if (bw === 1) setInputValue(1);
                  else if (bw === 2) setInputValue(2);
                  else if (bw === 3) setInputValue(5);
                  else if (bw === 4) setInputValue(14);
                  else if (bw === 5) setInputValue(27);
                  else if (bw === 6) setInputValue(54);
                  else if (bw === 7) setInputValue(81);
                  else if (bw === 8) setInputValue(218);
                  else if (bw === 16) setInputValue(54321);
                  else if (bw === 24) setInputValue(16744512);
                  else if (bw === 32) setInputValue(123456789);
                  setLastPeekedValue(null);
                  setIsMatch(null);
                }}
                className={`py-2 px-1 text-center rounded border transition text-xs font-bold cursor-pointer ${
                  isSelected
                    ? 'bg-yellow-400 text-black border-white shadow-md shadow-yellow-400/30 scale-102'
                    : 'bg-blue-950/80 hover:bg-blue-900 border-blue-500/40 text-blue-100'
                }`}
              >
                <div className="text-[12px]">{bw}-Bit</div>
                <div className={`text-[10px] truncate ${isSelected ? 'text-blue-950' : 'text-blue-300'}`}>
                  0..{bw > 8 ? (bw === 16 ? '65K' : bw === 24 ? '16M' : '4G') : itemMeta.maxVal}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Bit Specification Banner */}
        <div className="mt-3 p-2.5 rounded bg-blue-950/90 border border-blue-500/50 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2 text-blue-100">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase">Specification:</span>
            <span className="font-bold text-yellow-300 text-sm">{meta.name}</span>
            <div className="text-[11px] text-gray-300">
              Range: <strong className="text-white">{meta.minVal}</strong> to <strong className="text-white">{meta.maxVal.toLocaleString()}</strong>
            </div>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase">Density &amp; QBasic Type:</span>
            <span className="font-bold text-emerald-300">{meta.density}</span>
            <div className="text-[11px] text-gray-300">QBasic Type: <span className="text-yellow-200">{meta.qbasicType}</span></div>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase">Classic DOS Application:</span>
            <span className="text-[11px] text-blue-200 line-clamp-2">{meta.typicalUse}</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive POKE & PEEK Controller & Live Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-[#000080]/90 border border-blue-600/70 rounded-md p-3.5 shadow-md space-y-3.5">
          <div className="flex items-center justify-between border-b border-blue-500/30 pb-2">
            <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              POKE / PEEK CONTROLLER
            </span>
            <span className="text-[11px] text-blue-300">DEF SEG = &amp;H{segment.toString(16).toUpperCase()}</span>
          </div>

          {/* Index & Value Inputs */}
          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-blue-200 mb-1">
                <span>Item Index in Stream (i):</span>
                <span className="text-yellow-300 font-bold">#{itemIndex}</span>
              </div>
              <input
                type="number"
                min={0}
                max={255}
                value={itemIndex}
                onChange={(e) => setItemIndex(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-blue-950 border border-blue-500 rounded px-2.5 py-1.5 text-yellow-200 text-xs focus:outline-none focus:border-yellow-400"
              />
              <div className="flex gap-1 mt-1">
                {[0, 1, 2, 3, 4, 7, 8, 15].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setItemIndex(idx)}
                    className="px-1.5 py-0.5 text-[10px] bg-blue-900 hover:bg-blue-800 rounded border border-blue-600 text-blue-200 cursor-pointer"
                  >
                    #{idx}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-blue-200 mb-1">
                <span>Target Value to POKE:</span>
                <span className="text-emerald-300 font-bold">
                  {inputValue} <span className="text-gray-400">(&amp;H{inputValue.toString(16).toUpperCase()})</span>
                </span>
              </div>
              <input
                type="number"
                min={meta.minVal}
                max={meta.maxVal}
                value={inputValue}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setInputValue(Math.min(meta.maxVal, Math.max(meta.minVal, val)));
                }}
                className="w-full bg-blue-950 border border-blue-500 rounded px-2.5 py-1.5 text-emerald-300 font-bold text-xs focus:outline-none focus:border-yellow-400"
              />
              {/* Slider for values up to 255 */}
              {meta.maxVal <= 255 && (
                <input
                  type="range"
                  min={meta.minVal}
                  max={meta.maxVal}
                  value={inputValue}
                  onChange={(e) => setInputValue(parseInt(e.target.value))}
                  className="w-full mt-1.5 accent-yellow-400 cursor-pointer"
                />
              )}

              {/* Quick Preset Buttons for this bit width */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                <button
                  onClick={() => setInputValue(meta.minVal)}
                  className="px-2 py-0.5 text-[10px] bg-blue-900 hover:bg-blue-800 rounded border border-blue-600 text-blue-200 cursor-pointer"
                >
                  Min (0)
                </button>
                <button
                  onClick={() => setInputValue(Math.floor(meta.maxVal / 2))}
                  className="px-2 py-0.5 text-[10px] bg-blue-900 hover:bg-blue-800 rounded border border-blue-600 text-blue-200 cursor-pointer"
                >
                  Mid ({Math.floor(meta.maxVal / 2)})
                </button>
                <button
                  onClick={() => setInputValue(meta.maxVal)}
                  className="px-2 py-0.5 text-[10px] bg-blue-900 hover:bg-blue-800 rounded border border-blue-600 text-blue-200 cursor-pointer"
                >
                  Max ({meta.maxVal.toLocaleString()})
                </button>
                <button
                  onClick={() => {
                    const rnd = Math.floor(Math.random() * (meta.maxVal + 1));
                    setInputValue(rnd);
                  }}
                  className="px-2 py-0.5 text-[10px] bg-blue-900 hover:bg-blue-800 rounded border border-blue-600 text-yellow-300 cursor-pointer"
                >
                  Random
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePoke}
                className="flex items-center justify-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold py-2 px-3 rounded text-xs shadow transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>POKE VALUE</span>
              </button>

              <button
                onClick={handlePeek}
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded text-xs shadow transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>PEEK VALUE</span>
              </button>
            </div>

            <button
              onClick={handleFillSequence}
              className="w-full bg-blue-900 hover:bg-blue-800 border border-blue-500/60 text-blue-100 py-1.5 rounded text-xs transition cursor-pointer"
              title="Fills a test pattern into memory"
            >
              Fill Sequential Pattern (Indices 0..15)
            </button>
          </div>

          {/* Peek Result Banner */}
          {lastPeekedValue !== null && (
            <div
              className={`p-2 rounded border text-xs flex items-center justify-between ${
                isMatch
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-500 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  PEEK Result: <strong className="text-white text-sm">{lastPeekedValue}</strong>
                  <span className="text-gray-300 ml-1">(&amp;H{lastPeekedValue.toString(16).toUpperCase()})</span>
                </span>
              </div>
              <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-black/40">
                {isMatch ? 'VERIFIED MATCH' : 'MISMATCH'}
              </span>
            </div>
          )}
        </div>

        {/* Live Bitwise Operation Visualizer */}
        <div className="lg:col-span-7 bg-[#000080]/90 border border-blue-600/70 rounded-md p-3.5 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-blue-500/30 pb-2">
            <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              LIVE BITWISE TRANSFORMATION &amp; BYTE DIAGRAM
            </span>
            <span className="text-[11px] text-emerald-300">
              {activeTrace ? `POKE ${activeTrace.bitWidth}-Bit completed` : 'Awaiting POKE'}
            </span>
          </div>

          {/* Byte & Bit Visualization */}
          {activeTrace && activeTrace.affectedBytes.length > 0 ? (
            <div className="space-y-3 text-xs">
              {activeTrace.affectedBytes.map((aff, i) => {
                const prevBin = aff.prevVal.toString(2).padStart(8, '0');
                const newBin = aff.newVal.toString(2).padStart(8, '0');

                return (
                  <div key={i} className="bg-blue-950/90 border border-blue-500/40 rounded p-2.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">
                        Byte Offset:{' '}
                        <strong className="text-yellow-300">
                          &amp;H{aff.offset.toString(16).toUpperCase().padStart(4, '0')}
                        </strong>{' '}
                        ({aff.offset} dec)
                      </span>
                      <span className="text-gray-400 text-[11px]">
                        Old: {aff.prevVal} (&amp;H{aff.prevVal.toString(16).toUpperCase().padStart(2, '0')}){' '}
                        <ArrowRight className="inline w-3 h-3 text-yellow-400" /> New: {aff.newVal} (&amp;H
                        {aff.newVal.toString(16).toUpperCase().padStart(2, '0')})
                      </span>
                    </div>

                    {/* 8-bit visual cells */}
                    <div>
                      <div className="text-[10px] text-gray-400 flex justify-between px-1 mb-1">
                        <span>Bit 7 (MSB)</span>
                        <span>Bit 0 (LSB)</span>
                      </div>
                      <div className="grid grid-cols-8 gap-1 text-center font-mono">
                        {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
                          const bitVal = (aff.newVal >> bit) & 1;
                          const wasChanged = aff.bitsChanged.includes(bit);

                          return (
                            <div
                              key={bit}
                              className={`p-1.5 rounded border text-xs flex flex-col items-center justify-center transition ${
                                wasChanged
                                  ? 'bg-emerald-500 border-emerald-300 text-black font-extrabold ring-1 ring-emerald-300'
                                  : bitVal === 1
                                  ? 'bg-blue-800 border-blue-600 text-white'
                                  : 'bg-blue-950 border-blue-900 text-gray-500'
                              }`}
                            >
                              <span className="text-[9px] opacity-70">b{bit}</span>
                              <span className="text-sm font-bold">{bitVal}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Little-Endian breakdown for multi-byte */}
              {selectedBitWidth >= 16 && (
                <div className="p-2 rounded bg-black/40 border border-blue-700/60 text-[11px] text-gray-300">
                  <span className="text-yellow-300 font-bold block mb-1">
                    x86 Little-Endian Architecture Breakdown:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-center">
                    <div className="p-1 rounded bg-blue-950 border border-blue-800">
                      <span className="text-[10px] text-gray-400 block">Byte 0 (Least Sig)</span>
                      <strong className="text-emerald-300">
                        {memory[baseOffset + itemIndex * (selectedBitWidth / 8)] ?? 0}
                      </strong>
                    </div>
                    <div className="p-1 rounded bg-blue-950 border border-blue-800">
                      <span className="text-[10px] text-gray-400 block">Byte 1</span>
                      <strong className="text-emerald-300">
                        {memory[baseOffset + itemIndex * (selectedBitWidth / 8) + 1] ?? 0}
                      </strong>
                    </div>
                    {selectedBitWidth >= 24 && (
                      <div className="p-1 rounded bg-blue-950 border border-blue-800">
                        <span className="text-[10px] text-gray-400 block">Byte 2</span>
                        <strong className="text-emerald-300">
                          {memory[baseOffset + itemIndex * (selectedBitWidth / 8) + 2] ?? 0}
                        </strong>
                      </div>
                    )}
                    {selectedBitWidth === 32 && (
                      <div className="p-1 rounded bg-blue-950 border border-blue-800">
                        <span className="text-[10px] text-gray-400 block">Byte 3 (Most Sig)</span>
                        <strong className="text-emerald-300">
                          {memory[baseOffset + itemIndex * (selectedBitWidth / 8) + 3] ?? 0}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mathematical Explanation List */}
              <div className="p-2 bg-blue-950/70 border border-blue-800 rounded space-y-1 text-[11px] text-blue-200">
                <span className="font-bold text-yellow-300 block">Bitwise Arithmetic Steps:</span>
                {activeTrace.stepExplanation.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-yellow-400">•</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {/* Exact QBasic Code Line */}
              <div className="p-2 bg-black/60 rounded border border-blue-700/60 font-mono text-xs flex items-center justify-between">
                <div>
                  <span className="text-gray-400 text-[10px] block">EQUIVALENT QBASIC SUB INVOCATION:</span>
                  <span className="text-yellow-300 font-bold">{activeTrace.qbasicCodeSnippet}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-blue-300/80 text-xs space-y-2">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto opacity-70 animate-pulse" />
              <p>Click <strong className="text-yellow-300">"POKE VALUE"</strong> above to write into virtual memory.</p>
              <p className="text-gray-400 text-[11px]">
                The live bit transformer will illustrate exact masks, bit shifts, and affected memory addresses.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Visual Pixel Canvas & Palette Screen Preview */}
      <div className="bg-[#000080]/90 border border-blue-600/70 rounded-md p-3.5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-500/30 pb-2 mb-3">
          <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            LIVE SCREEN / GRAPHICS INTERPRETATION OF MEMORY
          </span>
          <span className="text-xs text-blue-200">
            Rendered directly from the active 512-byte memory segment using {selectedBitWidth}-bit interpretation
          </span>
        </div>

        {/* Dynamic Display based on Bit Width */}
        <div className="bg-black p-3 rounded border border-blue-800/80 flex flex-col items-center justify-center">
          {selectedBitWidth === 1 && (
            <div className="space-y-1.5 text-center">
              <span className="text-[11px] text-gray-400">
                1-Bit Monochrome Bitmap (32 cols x 16 rows = 512 bits / 64 bytes):
              </span>
              <div className="inline-grid grid-cols-32 gap-[1px] bg-gray-900 p-1 rounded border border-gray-700">
                {Array.from({ length: 512 }).map((_, bitIdx) => {
                  const byteOff = Math.floor(bitIdx / 8);
                  const bitPos = bitIdx % 8;
                  const isSet = ((memory[byteOff] ?? 0) >> bitPos) & 1;
                  return (
                    <div
                      key={bitIdx}
                      title={`Bit #${bitIdx} at byte &H${byteOff.toString(16)}: ${isSet}`}
                      className={`w-2 h-2 sm:w-2.5 sm:h-2.5 transition ${
                        isSet ? 'bg-white' : 'bg-black'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {selectedBitWidth === 2 && (
            <div className="space-y-1.5 text-center">
              <span className="text-[11px] text-gray-400">
                2-Bit CGA Palette 1 (32 cols x 8 rows = 256 pixels / 64 bytes) [Black, Cyan, Magenta, White]:
              </span>
              <div className="inline-grid grid-cols-32 gap-[1px] bg-gray-900 p-1 rounded border border-gray-700">
                {Array.from({ length: 256 }).map((_, pixelIdx) => {
                  const byteOff = Math.floor(pixelIdx / 4);
                  const shift = (pixelIdx % 4) * 2;
                  const colorIdx = ((memory[byteOff] ?? 0) >> shift) & 3;
                  return (
                    <div
                      key={pixelIdx}
                      title={`Pixel #${pixelIdx}: Color ${colorIdx}`}
                      style={{ backgroundColor: CGA_PALETTE[colorIdx] }}
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {selectedBitWidth === 4 && (
            <div className="space-y-1.5 text-center">
              <span className="text-[11px] text-gray-400">
                4-Bit EGA/VGA 16-Color Palette (16 cols x 8 rows = 128 pixels / 64 bytes):
              </span>
              <div className="inline-grid grid-cols-16 gap-[1px] bg-gray-900 p-1 rounded border border-gray-700">
                {Array.from({ length: 128 }).map((_, pixelIdx) => {
                  const byteOff = Math.floor(pixelIdx / 2);
                  const isHigh = pixelIdx % 2 === 1;
                  const byte = memory[byteOff] ?? 0;
                  const colorIdx = isHigh ? (byte >> 4) & 0x0F : byte & 0x0F;
                  return (
                    <div
                      key={pixelIdx}
                      title={`Pixel #${pixelIdx}: Color ${colorIdx}`}
                      style={{ backgroundColor: EGA_PALETTE[colorIdx] }}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {selectedBitWidth === 8 && (
            <div className="space-y-1.5 text-center">
              <span className="text-[11px] text-gray-400">
                8-Bit VGA Mode 13h Color Indices (16 cols x 8 rows = 128 bytes):
              </span>
              <div className="inline-grid grid-cols-16 gap-[1px] bg-gray-900 p-1 rounded border border-gray-700">
                {Array.from({ length: 128 }).map((_, idx) => {
                  const val = memory[idx] ?? 0;
                  // Map 0..255 to a colorful HSL swatch
                  const hsl = `hsl(${(val * 137.5) % 360}, 80%, ${Math.max(15, (val / 255) * 70)}%)`;
                  return (
                    <div
                      key={idx}
                      title={`Byte #${idx}: Val ${val}`}
                      style={{ backgroundColor: hsl }}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {(selectedBitWidth === 16 || selectedBitWidth === 24 || selectedBitWidth === 32 || selectedBitWidth === 3 || selectedBitWidth === 5 || selectedBitWidth === 6 || selectedBitWidth === 7) && (
            <div className="space-y-2 text-center w-full max-w-xl">
              <span className="text-[11px] text-gray-400">
                {selectedBitWidth}-Bit Value Sequence Inspector (First 16 Elements in Buffer):
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const val = peekValue(memory, baseOffset, selectedBitWidth, idx);
                  const isCurrent = idx === itemIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => setItemIndex(idx)}
                      className={`p-1.5 rounded border text-xs cursor-pointer transition ${
                        isCurrent
                          ? 'bg-yellow-400 text-black font-extrabold ring-1 ring-white'
                          : 'bg-blue-950/80 border-blue-700 text-blue-200 hover:border-blue-400'
                      }`}
                    >
                      <span className="text-[9px] block text-gray-400">#{idx}</span>
                      <span className="text-[11px] font-mono truncate block font-bold">
                        {val > 999999 ? `${(val / 1000000).toFixed(1)}M` : val}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
