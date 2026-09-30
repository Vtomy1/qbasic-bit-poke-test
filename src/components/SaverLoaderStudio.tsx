import React, { useState } from 'react';
import { buildBSAVEFile, parseBSAVEFile } from '../utils/bitEngine';
import { Save, FolderOpen, RefreshCw, CheckCircle, FileCode, HardDrive, ArrowRight, ShieldCheck } from 'lucide-react';

interface SaverLoaderStudioProps {
  memory: Uint8Array;
  setMemory: React.Dispatch<React.SetStateAction<Uint8Array>>;
  segment: number;
  baseOffset: number;
}

export const SaverLoaderStudio: React.FC<SaverLoaderStudioProps> = ({
  memory,
  setMemory,
  segment,
  baseOffset,
}) => {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  // Build authentic BSAVE file
  const bsaveData = buildBSAVEFile(memory, segment, baseOffset, memory.length);

  const handleDownloadBSAVE = () => {
    const blob = new Blob([bsaveData as unknown as BlobPart], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BITDATA.BSV';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadBinary = () => {
    const blob = new Blob([memory as unknown as BlobPart], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BITDATA.BIN';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      if (!buffer) return;

      const raw = new Uint8Array(buffer);
      if (raw.length >= 7 && raw[0] === 0xFD) {
        // BSAVE format
        const { header, payload } = parseBSAVEFile(raw);
        const next = new Uint8Array(memory.length);
        next.set(payload.slice(0, memory.length));
        setMemory(next);
        setIsSuccess(true);
        setTestResult(
          `Successfully loaded authentic BSAVE file! Seg: &H${header?.segment.toString(16).toUpperCase()}, Off: &H${header?.offset.toString(16).toUpperCase()}, Len: ${header?.length} bytes.`
        );
      } else {
        // Raw binary
        const next = new Uint8Array(memory.length);
        next.set(raw.slice(0, memory.length));
        setMemory(next);
        setIsSuccess(true);
        setTestResult(`Successfully loaded raw binary file (${raw.length} bytes)!`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSimulateRoundTrip = () => {
    // 1. Snapshot original memory
    const original = new Uint8Array(memory);

    // 2. Build BSAVE binary in-memory
    const saved = buildBSAVEFile(memory, segment, baseOffset, memory.length);

    // 3. Wipe memory with 0xAA pattern
    const wiped = new Uint8Array(memory.length);
    wiped.fill(0xAA);
    setMemory(wiped);

    // 4. Reload from BSAVE after small delay
    setTimeout(() => {
      const { payload } = parseBSAVEFile(saved);
      const restored = new Uint8Array(memory.length);
      restored.set(payload.slice(0, memory.length));
      setMemory(restored);

      // Verify
      let matches = true;
      for (let i = 0; i < original.length; i++) {
        if (original[i] !== restored[i]) {
          matches = false;
          break;
        }
      }

      setIsSuccess(matches);
      if (matches) {
        setTestResult(
          '100% Round-trip Verification Succeeded! Memory was saved to BSAVE format, cleared, and restored with 0 bit errors.'
        );
      } else {
        setTestResult('Round-trip verification failed: data mismatch after restoration.');
      }
    }, 400);
  };

  return (
    <div className="space-y-4 font-mono text-white">
      {/* Introduction Card */}
      <div className="bg-[#000080]/90 border border-blue-600/70 rounded-md p-3.5 shadow-md">
        <div className="flex items-center space-x-2 border-b border-blue-500/30 pb-2 mb-3">
          <HardDrive className="w-4 h-4 text-yellow-300" />
          <h2 className="text-sm font-bold text-yellow-300">
            QBASIC SAVER &amp; LOADER ARCHITECTURE
          </h2>
        </div>

        <p className="text-xs text-blue-100 leading-relaxed">
          QuickBASIC 4.5 and MS-DOS provide two primary mechanisms to save and load packed bit memory buffers to disk:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
          <div className="p-3 rounded bg-blue-950/80 border border-blue-600/50 space-y-1.5">
            <div className="flex items-center justify-between text-yellow-300 font-bold">
              <span>METHOD 1: BSAVE &amp; BLOAD</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900 text-blue-200">MS-DOS Native</span>
            </div>
            <p className="text-gray-300 text-[11px]">
              Direct binary memory dump. Prefixes a standardized 7-byte DOS header containing segment, offset, and payload length. Ultra-fast for VGA screens and arrays.
            </p>
            <div className="bg-black/60 p-2 rounded text-[11px] text-cyan-200">
              BSAVE "DATA.BSV", offset&amp;, length&amp;
              <br />
              BLOAD "DATA.BSV", offset&amp;
            </div>
          </div>

          <div className="p-3 rounded bg-blue-950/80 border border-blue-600/50 space-y-1.5">
            <div className="flex items-center justify-between text-emerald-300 font-bold">
              <span>METHOD 2: OPEN FOR BINARY (PUT / GET)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900 text-blue-200">Universal</span>
            </div>
            <p className="text-gray-300 text-[11px]">
              Portable across all platforms and compilers. Reads/writes exact byte streams without any proprietary headers or segment constraints.
            </p>
            <div className="bg-black/60 p-2 rounded text-[11px] text-cyan-200">
              OPEN "DATA.BIN" FOR BINARY AS #1
              <br />
              PUT #1, , byteChar$
            </div>
          </div>
        </div>
      </div>

      {/* BSAVE 7-Byte Header Visual Inspector */}
      <div className="bg-[#000080]/90 border border-blue-600/70 rounded-md p-3.5 shadow-md">
        <div className="flex items-center justify-between border-b border-blue-500/30 pb-2 mb-3">
          <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5" />
            AUTHENTIC MS-DOS BSAVE 7-BYTE HEADER INSPECTOR
          </span>
          <span className="text-xs text-blue-200">
            Current File Size: {bsaveData.length} bytes (7 bytes header + {memory.length} bytes memory)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded bg-blue-950/90 border border-blue-700">
            <span className="text-gray-400 block text-[10px]">Byte 0: Signature</span>
            <span className="text-lg font-bold text-yellow-300 font-mono">
              &amp;H{bsaveData[0].toString(16).toUpperCase()}
            </span>
            <span className="text-[10px] text-gray-300 block">Required BSAVE marker (253 dec)</span>
          </div>

          <div className="p-2.5 rounded bg-blue-950/90 border border-blue-700">
            <span className="text-gray-400 block text-[10px]">Bytes 1-2: Segment</span>
            <span className="text-lg font-bold text-emerald-300 font-mono">
              &amp;H{segment.toString(16).toUpperCase().padStart(4, '0')}
            </span>
            <span className="text-[10px] text-gray-300 block">
              Low: &amp;H{bsaveData[1].toString(16).toUpperCase()} · High: &amp;H{bsaveData[2].toString(16).toUpperCase()}
            </span>
          </div>

          <div className="p-2.5 rounded bg-blue-950/90 border border-blue-700">
            <span className="text-gray-400 block text-[10px]">Bytes 3-4: Offset</span>
            <span className="text-lg font-bold text-cyan-300 font-mono">
              &amp;H{baseOffset.toString(16).toUpperCase().padStart(4, '0')}
            </span>
            <span className="text-[10px] text-gray-300 block">
              Low: &amp;H{bsaveData[3].toString(16).toUpperCase()} · High: &amp;H{bsaveData[4].toString(16).toUpperCase()}
            </span>
          </div>

          <div className="p-2.5 rounded bg-blue-950/90 border border-blue-700">
            <span className="text-gray-400 block text-[10px]">Bytes 5-6: Length</span>
            <span className="text-lg font-bold text-purple-300 font-mono">
              {memory.length} B
            </span>
            <span className="text-[10px] text-gray-300 block">
              Low: &amp;H{bsaveData[5].toString(16).toUpperCase()} · High: &amp;H{bsaveData[6].toString(16).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="mt-3 p-2 bg-black/60 rounded border border-blue-800 text-[11px] font-mono flex items-center justify-between">
          <span className="text-gray-400">Raw Header Hex:</span>
          <span className="text-yellow-300 font-bold">
            {Array.from(bsaveData.slice(0, 7))
              .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
              .join(' ')}
          </span>
        </div>
      </div>

      {/* Interactive Actions & Roundtrip Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export & Save Box */}
        <div className="bg-[#000080]/90 border border-blue-600/70 rounded-md p-3.5 shadow-md space-y-3">
          <div className="flex items-center space-x-2 border-b border-blue-500/30 pb-2">
            <Save className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-yellow-300">EXPORT / SAVE MEMORY BUFFER</h3>
          </div>

          <p className="text-xs text-blue-200">
            Download the active virtual memory buffer as a real file to your computer:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleDownloadBSAVE}
              className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded text-xs transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>SAVE AS .BSV</span>
            </button>

            <button
              onClick={handleDownloadBinary}
              className="flex items-center justify-center gap-1.5 bg-blue-900 hover:bg-blue-800 border border-blue-500 text-white font-bold py-2 px-3 rounded text-xs transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>SAVE RAW .BIN</span>
            </button>
          </div>
        </div>

        {/* Import & Load Box */}
        <div className="bg-[#000080]/90 border border-blue-600/70 rounded-md p-3.5 shadow-md space-y-3">
          <div className="flex items-center space-x-2 border-b border-blue-500/30 pb-2">
            <FolderOpen className="w-4 h-4 text-cyan-300" />
            <h3 className="text-xs font-bold text-yellow-300">LOAD FILE INTO VIRTUAL MEMORY</h3>
          </div>

          <p className="text-xs text-blue-200">
            Upload an authentic .BSV or raw .BIN file to restore it directly into the memory inspector:
          </p>

          <label className="flex items-center justify-center gap-2 bg-blue-950 hover:bg-blue-900 border border-dashed border-blue-400 text-blue-200 hover:text-white py-2 px-3 rounded text-xs cursor-pointer transition">
            <FolderOpen className="w-4 h-4" />
            <span>Choose .BSV or .BIN file...</span>
            <input
              type="file"
              accept=".bsv,.bin,.dat"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Automated Round-Trip Simulation */}
      <div className="bg-[#000080]/90 border border-blue-600/70 rounded-md p-3.5 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-blue-500/30 pb-2">
          <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            SIMULATE FULL BSAVE &rarr; WIPE MEMORY &rarr; BLOAD CYCLE
          </span>
        </div>

        <p className="text-xs text-blue-200">
          This test exercises the entire serialization pipeline: saves current memory with the 7-byte header, fills memory with garbage data (0xAA), and restores it via simulated BLOAD to verify bit-level fidelity.
        </p>

        <button
          onClick={handleSimulateRoundTrip}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold px-4 py-2 rounded text-xs transition shadow-sm cursor-pointer"
        >
          EXECUTE BSAVE &amp; BLOAD CYCLE NOW
        </button>

        {testResult && (
          <div
            className={`p-3 rounded border text-xs flex items-center gap-2.5 ${
              isSuccess
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500 text-rose-200'
            }`}
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold block">{isSuccess ? 'TEST PASSED' : 'TEST NOTICE'}</span>
              <span>{testResult}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
