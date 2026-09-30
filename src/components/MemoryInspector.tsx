import React, { useState } from 'react';
import { RefreshCw, FileText, Binary, Sparkles } from 'lucide-react';
import { generatePreset } from '../utils/bitEngine';

interface MemoryInspectorProps {
  memory: Uint8Array;
  setMemory: React.Dispatch<React.SetStateAction<Uint8Array>>;
  baseOffset: number;
  segment: number;
  highlightedOffsets: number[];
  onSelectByte?: (offset: number) => void;
}

export const MemoryInspector: React.FC<MemoryInspectorProps> = ({
  memory,
  setMemory,
  baseOffset,
  segment,
  highlightedOffsets,
  onSelectByte,
}) => {
  const [selectedByteOffset, setSelectedByteOffset] = useState<number>(0);
  const rows = Math.ceil(memory.length / 16);

  const selectedValue = memory[selectedByteOffset] ?? 0;

  const handleBitToggle = (bitIdx: number) => {
    const next = new Uint8Array(memory);
    const mask = 1 << bitIdx;
    next[selectedByteOffset] = next[selectedByteOffset] ^ mask;
    setMemory(next);
  };

  const handleApplyPreset = (presetName: string) => {
    const updated = generatePreset(memory, presetName);
    setMemory(updated);
  };

  return (
    <div className="bg-[#000080]/90 border border-blue-600/60 rounded-md p-3 text-white font-mono shadow-md">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-blue-600/40">
        <div className="flex items-center space-x-2">
          <Binary className="w-4 h-4 text-yellow-300" />
          <span className="font-bold text-sm text-yellow-300">
            MEMORY INSPECTOR (DEF SEG = &amp;H{segment.toString(16).toUpperCase()})
          </span>
          <span className="text-xs text-blue-200">
            [{memory.length} bytes · Range &amp;H0000..&amp;H{(memory.length - 1).toString(16).toUpperCase().padStart(4, '0')}]
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <label className="text-blue-200 text-xs">Presets:</label>
          <select
            onChange={(e) => {
              if (e.target.value) handleApplyPreset(e.target.value);
            }}
            defaultValue=""
            className="bg-blue-950 border border-blue-500 rounded px-2 py-1 text-xs text-yellow-200 focus:outline-none focus:border-yellow-400 cursor-pointer"
          >
            <option value="" disabled>Load Memory Pattern...</option>
            <option value="monochrome_text">1-Bit Monochrome Bitmap</option>
            <option value="cga_pattern">2-Bit CGA 4-Color Tiles</option>
            <option value="ega_gradient">4-Bit EGA/VGA 16-Color Gradient</option>
            <option value="multi_ints">16/32-Bit Word Sequence</option>
            <option value="all_zero">Zero Out (0x00)</option>
            <option value="all_ones">Fill Ones (0xFF)</option>
          </select>

          <button
            onClick={() => handleApplyPreset('all_zero')}
            className="flex items-center gap-1 bg-blue-900 hover:bg-blue-800 border border-blue-500/50 px-2 py-1 rounded text-xs text-blue-200 hover:text-white cursor-pointer"
            title="Clear all bytes to 0"
          >
            <RefreshCw className="w-3 h-3" />
            <span>CLS</span>
          </button>
        </div>
      </div>

      {/* Selected Byte Detail Bar */}
      <div className="mb-3 bg-blue-950/80 border border-blue-500/40 rounded p-2 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-gray-300">
            Selected Offset:{' '}
            <strong className="text-yellow-300 font-bold">
              &amp;H{selectedByteOffset.toString(16).toUpperCase().padStart(4, '0')}
            </strong>{' '}
            <span className="text-gray-400">({selectedByteOffset} dec)</span>
          </span>
          <span className="text-gray-300">
            Val: <strong className="text-emerald-300">{selectedValue}</strong>{' '}
            <span className="text-gray-400">(&amp;H{selectedValue.toString(16).toUpperCase().padStart(2, '0')})</span>
          </span>
        </div>

        {/* 8-Bit Interactive Toggle */}
        <div className="flex items-center gap-1.5">
          <span className="text-blue-300 text-[11px] mr-1">Bits 7..0:</span>
          <div className="flex items-center gap-0.5">
            {[7, 6, 5, 4, 3, 2, 1, 0].map((bitIdx) => {
              const isSet = ((selectedValue >> bitIdx) & 1) === 1;
              return (
                <button
                  key={bitIdx}
                  onClick={() => handleBitToggle(bitIdx)}
                  title={`Click to toggle Bit ${bitIdx} (weight ${1 << bitIdx})`}
                  className={`w-6 h-6 text-[11px] font-bold rounded flex items-center justify-center transition border cursor-pointer ${
                    isSet
                      ? 'bg-emerald-500 border-emerald-300 text-black shadow-xs shadow-emerald-400/50'
                      : 'bg-blue-900 border-blue-700 text-gray-400 hover:border-blue-400'
                  }`}
                >
                  {isSet ? '1' : '0'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hex Dump Table */}
      <div className="overflow-x-auto max-h-72 overflow-y-auto bg-black/60 rounded border border-blue-800/80 p-2 text-xs select-none">
        <table className="w-full border-collapse font-mono text-[11px] leading-tight">
          <thead>
            <tr className="text-blue-400 border-b border-blue-900 text-left">
              <th className="py-1 pr-3 w-16">Offset</th>
              <th className="py-1 px-1">00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F</th>
              <th className="py-1 pl-3 text-center w-28">ASCII</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => {
              const rowOffset = rowIndex * 16;
              const rowBytes = Array.from(memory.slice(rowOffset, rowOffset + 16));

              // ASCII representation
              const asciiStr = rowBytes
                .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
                .join('');

              return (
                <tr key={rowIndex} className="hover:bg-blue-950/40 font-mono">
                  {/* Offset Header */}
                  <td className="text-yellow-400/90 font-bold pr-2 py-0.5 whitespace-nowrap">
                    {rowOffset.toString(16).toUpperCase().padStart(4, '0')}:
                  </td>

                  {/* 16 Hex Bytes */}
                  <td className="py-0.5 whitespace-nowrap">
                    <div className="inline-flex gap-1">
                      {rowBytes.map((byteVal, colIndex) => {
                        const currentOffset = rowOffset + colIndex;
                        const isHighlighted = highlightedOffsets.includes(currentOffset);
                        const isSelected = selectedByteOffset === currentOffset;

                        return (
                          <React.Fragment key={colIndex}>
                            {colIndex === 8 && <span className="w-1.5" />}
                            <span
                              onClick={() => {
                                setSelectedByteOffset(currentOffset);
                                if (onSelectByte) onSelectByte(currentOffset);
                              }}
                              title={`Offset: &H${currentOffset.toString(16).toUpperCase()} (${currentOffset})\nValue: ${byteVal} (&H${byteVal.toString(16).toUpperCase()})\nBinary: ${byteVal.toString(2).padStart(8, '0')}`}
                              className={`px-0.5 rounded cursor-pointer transition ${
                                isSelected
                                  ? 'bg-yellow-400 text-black font-extrabold ring-1 ring-white'
                                  : isHighlighted
                                  ? 'bg-emerald-400 text-black font-bold animate-pulse'
                                  : byteVal !== 0
                                  ? 'text-cyan-200 hover:bg-blue-800'
                                  : 'text-gray-500 hover:bg-blue-900/60'
                              }`}
                            >
                              {byteVal.toString(16).toUpperCase().padStart(2, '0')}
                            </span>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </td>

                  {/* ASCII column */}
                  <td className="pl-3 py-0.5 text-gray-400 font-mono tracking-wider whitespace-nowrap">
                    {asciiStr}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
