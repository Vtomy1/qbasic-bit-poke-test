import React, { useState } from 'react';
import { BitWidth } from '../types/qbasic';
import {
  getFullQBasicCode,
  getIsolatedSnippet,
  getFileIOSnippets,
  BIT_METADATA,
} from '../utils/qbasicCode';
import { Copy, Download, Check, Code2, BookOpen, Cpu, ShieldCheck } from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<
    'full' | 'sub-byte' | 'multi-byte' | 'bsave' | 'binary' | 'guide'
  >('full');
  const [selectedSubBit, setSelectedSubBit] = useState<BitWidth>(1);
  const [selectedMultiBit, setSelectedMultiBit] = useState<BitWidth>(16);
  const [copied, setCopied] = useState(false);

  const fullCode = getFullQBasicCode();
  const fileIOSnippets = getFileIOSnippets();

  const getCurrentCode = (): string => {
    switch (activeCodeTab) {
      case 'full':
        return fullCode;
      case 'sub-byte':
        return getIsolatedSnippet(selectedSubBit);
      case 'multi-byte':
        return getIsolatedSnippet(selectedMultiBit);
      case 'bsave':
        return fileIOSnippets.bsave;
      case 'binary':
        return fileIOSnippets.binary;
      default:
        return fullCode;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const code = getCurrentCode();
    const filename =
      activeCodeTab === 'full'
        ? 'BITPOKE.BAS'
        : activeCodeTab === 'bsave'
        ? 'BSAVE_BLOAD.BAS'
        : activeCodeTab === 'binary'
        ? 'BIN_IO.BAS'
        : `POKE_${activeCodeTab === 'sub-byte' ? selectedSubBit : selectedMultiBit}BIT.BAS`;

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simple QBasic syntax highlighter
  const renderHighlightedCode = (rawCode: string) => {
    const lines = rawCode.split('\n');
    return (
      <div className="font-mono text-xs leading-relaxed select-text">
        {lines.map((line, idx) => {
          const trimmed = line.trimStart();

          // Comments
          if (trimmed.startsWith("'") || trimmed.toUpperCase().startsWith('REM')) {
            return (
              <div key={idx} className="text-emerald-400 font-normal">
                {line}
              </div>
            );
          }

          // Format keywords
          const parts = line.split(
            /(\b(?:SUB|FUNCTION|END SUB|END FUNCTION|DECLARE SUB|DECLARE FUNCTION|DEF SEG|DEFINT|INTEGER|LONG|DOUBLE|SINGLE|STRING|FOR|TO|NEXT|STEP|IF|THEN|ELSE|ELSEIF|END IF|DO|LOOP|WHILE|WEND|PRINT|CLS|COLOR|LOCATE|POKE|PEEK|BSAVE|BLOAD|OPEN|FOR BINARY|AS|PUT|GET|CLOSE|FREEFILE|CHR\$|ASC|HEX\$|VARSEG|VARPTR|AND|OR|XOR|NOT|MOD|EXIT|INKEY\$)\b)/gi
          );

          return (
            <div key={idx} className="text-gray-100">
              {parts.map((part, pIdx) => {
                const upper = part.toUpperCase();
                const isKeyword = [
                  'SUB',
                  'FUNCTION',
                  'END SUB',
                  'END FUNCTION',
                  'DECLARE SUB',
                  'DECLARE FUNCTION',
                  'DEF SEG',
                  'DEFINT',
                  'INTEGER',
                  'LONG',
                  'DOUBLE',
                  'SINGLE',
                  'STRING',
                  'FOR',
                  'TO',
                  'NEXT',
                  'STEP',
                  'IF',
                  'THEN',
                  'ELSE',
                  'ELSEIF',
                  'END IF',
                  'DO',
                  'LOOP',
                  'WHILE',
                  'WEND',
                  'PRINT',
                  'CLS',
                  'COLOR',
                  'LOCATE',
                  'POKE',
                  'PEEK',
                  'BSAVE',
                  'BLOAD',
                  'OPEN',
                  'FOR BINARY',
                  'AS',
                  'PUT',
                  'GET',
                  'CLOSE',
                  'FREEFILE',
                  'CHR$',
                  'ASC',
                  'HEX$',
                  'VARSEG',
                  'VARPTR',
                  'AND',
                  'OR',
                  'XOR',
                  'NOT',
                  'MOD',
                  'EXIT',
                  'INKEY$',
                ].includes(upper);

                if (isKeyword) {
                  return (
                    <span key={pIdx} className="text-yellow-300 font-bold">
                      {part}
                    </span>
                  );
                }

                // Numbers or Hex
                if (/^(&H[0-9A-Fa-f]+|\b\d+\b)/.test(part)) {
                  return (
                    <span key={pIdx} className="text-cyan-300">
                      {part}
                    </span>
                  );
                }

                return <span key={pIdx}>{part}</span>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4 font-mono text-white">
      {/* Code Category Tabs & Action Bar */}
      <div className="bg-[#000080]/90 border border-blue-600/70 rounded-md p-3 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-500/30 pb-2.5">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-yellow-300" />
            <span className="font-bold text-sm text-yellow-300">
              QBASIC / QUICKBASIC SOURCE CODE VAULT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 border border-blue-400/50 text-white px-3 py-1.5 rounded text-xs transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED TO CLIPBOARD!' : 'COPY CODE'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD .BAS</span>
            </button>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="flex flex-wrap gap-1 mt-2.5 text-xs">
          <button
            onClick={() => setActiveCodeTab('full')}
            className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
              activeCodeTab === 'full'
                ? 'bg-yellow-400 text-black shadow-xs'
                : 'bg-blue-950/80 text-blue-200 hover:bg-blue-900'
            }`}
          >
            ★ Full Complete Program (BITPOKE.BAS)
          </button>

          <button
            onClick={() => setActiveCodeTab('sub-byte')}
            className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
              activeCodeTab === 'sub-byte'
                ? 'bg-yellow-400 text-black shadow-xs'
                : 'bg-blue-950/80 text-blue-200 hover:bg-blue-900'
            }`}
          >
            1-Bit to 8-Bit (Sub-Byte POKE)
          </button>

          <button
            onClick={() => setActiveCodeTab('multi-byte')}
            className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
              activeCodeTab === 'multi-byte'
                ? 'bg-yellow-400 text-black shadow-xs'
                : 'bg-blue-950/80 text-blue-200 hover:bg-blue-900'
            }`}
          >
            16, 24, 32-Bit (Multi-Byte POKE)
          </button>

          <button
            onClick={() => setActiveCodeTab('bsave')}
            className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
              activeCodeTab === 'bsave'
                ? 'bg-yellow-400 text-black shadow-xs'
                : 'bg-blue-950/80 text-blue-200 hover:bg-blue-900'
            }`}
          >
            BSAVE &amp; BLOAD (Saver/Loader)
          </button>

          <button
            onClick={() => setActiveCodeTab('binary')}
            className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
              activeCodeTab === 'binary'
                ? 'bg-yellow-400 text-black shadow-xs'
                : 'bg-blue-950/80 text-blue-200 hover:bg-blue-900'
            }`}
          >
            Binary File PUT/GET (Saver/Loader)
          </button>

          <button
            onClick={() => setActiveCodeTab('guide')}
            className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
              activeCodeTab === 'guide'
                ? 'bg-yellow-400 text-black shadow-xs'
                : 'bg-blue-950/80 text-blue-200 hover:bg-blue-900'
            }`}
          >
            <BookOpen className="inline w-3 h-3 mr-1" />
            QBasic Gotchas &amp; Math Guide
          </button>
        </div>

        {/* Sub-selector for Sub-byte */}
        {activeCodeTab === 'sub-byte' && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-blue-600/40 text-xs">
            <span className="text-blue-300 mr-1 text-[11px]">Select bit width:</span>
            {([1, 2, 3, 4, 5, 6, 7, 8] as BitWidth[]).map((bw) => (
              <button
                key={bw}
                onClick={() => setSelectedSubBit(bw)}
                className={`px-2 py-1 rounded text-xs cursor-pointer ${
                  selectedSubBit === bw
                    ? 'bg-emerald-500 text-black font-extrabold'
                    : 'bg-blue-900 text-blue-200 hover:bg-blue-800'
                }`}
              >
                {bw}-Bit ({BIT_METADATA[bw].shortName})
              </button>
            ))}
          </div>
        )}

        {/* Sub-selector for Multi-byte */}
        {activeCodeTab === 'multi-byte' && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-blue-600/40 text-xs">
            <span className="text-blue-300 mr-1 text-[11px]">Select bit width:</span>
            {([16, 24, 32] as BitWidth[]).map((bw) => (
              <button
                key={bw}
                onClick={() => setSelectedMultiBit(bw)}
                className={`px-2 py-1 rounded text-xs cursor-pointer ${
                  selectedMultiBit === bw
                    ? 'bg-emerald-500 text-black font-extrabold'
                    : 'bg-blue-900 text-blue-200 hover:bg-blue-800'
                }`}
              >
                {bw}-Bit ({BIT_METADATA[bw].shortName})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Code Display Window or Guide */}
      {activeCodeTab === 'guide' ? (
        <div className="bg-[#000080]/90 border border-blue-600/70 rounded-md p-4 space-y-4 text-xs leading-relaxed">
          <div className="flex items-center space-x-2 border-b border-blue-500/40 pb-2">
            <BookOpen className="w-5 h-5 text-yellow-300" />
            <h2 className="text-sm font-bold text-yellow-300">
              ESSENTIAL QBASIC MEMORY &amp; BIT-MANIPULATION GOTCHAS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-950/80 border border-blue-600/40 p-3 rounded space-y-1.5">
              <h3 className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                1. Integer Division (\) vs Floating Division (/)
              </h3>
              <p className="text-gray-300">
                In QBasic, standard slash <code className="text-yellow-300">/</code> produces a floating-point number and rounds. Always use backslash <code className="text-yellow-300">\</code> for integer division:
              </p>
              <pre className="bg-black/60 p-2 rounded text-cyan-200">
                byteOffset&amp; = baseOffset&amp; + (bitIndex% \ 8)
              </pre>
              <p className="text-gray-400 text-[11px]">
                Backslash truncates towards zero and preserves exact memory offsets without floating-point rounding errors.
              </p>
            </div>

            <div className="bg-blue-950/80 border border-blue-600/40 p-3 rounded space-y-1.5">
              <h3 className="font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                2. Signed 32-Bit LONG Overflow Safeguard
              </h3>
              <p className="text-gray-300">
                QBasic's <code className="text-yellow-300">LONG &amp;</code> is a signed 32-bit integer (-2,147,483,648 to 2,147,483,647). Values with Bit 31 set will throw an "Overflow" error if treated as unsigned!
              </p>
              <pre className="bg-black/60 p-2 rounded text-cyan-200">
                v# = value&amp;
                <br />
                IF v# &lt; 0 THEN v# = v# + 4294967296#
              </pre>
              <p className="text-gray-400 text-[11px]">
                Using a 64-bit DOUBLE intermediate (<code className="text-yellow-300">#</code>) guarantees safe extraction of all 4 bytes without overflow.
              </p>
            </div>

            <div className="bg-blue-950/80 border border-blue-600/40 p-3 rounded space-y-1.5">
              <h3 className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                3. Bit Shifting in BASIC (2 ^ N)
              </h3>
              <p className="text-gray-300">
                QBasic lacks C-style <code className="text-yellow-300">&lt;&lt;</code> and <code className="text-yellow-300">&gt;&gt;</code> operators. Left shift is simulated with multiplication and right shift with integer division:
              </p>
              <pre className="bg-black/60 p-2 rounded text-cyan-200">
                Left Shift N:   val * (2 ^ N)
                <br />
                Right Shift N:  val \ (2 ^ N)
              </pre>
            </div>

            <div className="bg-blue-950/80 border border-blue-600/40 p-3 rounded space-y-1.5">
              <h3 className="font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                4. Preserving Adjacent Bits with Bitmasking
              </h3>
              <p className="text-gray-300">
                When writing sub-byte values (e.g. 4-bit nibbles or 1-bit flags), you must NEVER overwrite the whole byte directly. Always PEEK first, clean the target slot with an inverted mask, and OR in the new bits:
              </p>
              <pre className="bg-black/60 p-2 rounded text-cyan-200">
                cleanByte = curByte AND (255 - mask)
                <br />
                newByte = cleanByte OR (val * 2^shift)
                <br />
                POKE offset, newByte
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-black/85 border border-blue-600/70 rounded-md p-4 shadow-inner max-h-[600px] overflow-y-auto">
          {renderHighlightedCode(getCurrentCode())}
        </div>
      )}
    </div>
  );
};
