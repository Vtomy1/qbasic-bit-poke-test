import React, { useState } from 'react';
import { Header } from './components/Header';
import { BitPokeLab } from './components/BitPokeLab';
import { MemoryInspector } from './components/MemoryInspector';
import { CodeViewer } from './components/CodeViewer';
import { SaverLoaderStudio } from './components/SaverLoaderStudio';
import { TerminalRunner } from './components/TerminalRunner';
import { BitOperationTrace } from './types/qbasic';
import { createInitialMemory, DEFAULT_OFFSET, DEFAULT_SEGMENT } from './utils/bitEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<'lab' | 'code' | 'saver-loader' | 'terminal'>('lab');
  const [theme, setTheme] = useState<'dos' | 'dark' | 'paper'>('dos');
  const [memory, setMemory] = useState<Uint8Array>(() => createInitialMemory(512));
  const [segment] = useState<number>(DEFAULT_SEGMENT); // &H8000
  const [baseOffset] = useState<number>(DEFAULT_OFFSET); // &H0000
  const [activeTrace, setActiveTrace] = useState<BitOperationTrace | null>(null);
  const [highlightedOffsets, setHighlightedOffsets] = useState<number[]>([]);

  const handleTraceUpdate = (trace: BitOperationTrace) => {
    setActiveTrace(trace);
    setHighlightedOffsets(trace.affectedBytes.map((b) => b.offset));
    // Clear highlight pulse after 2 seconds
    setTimeout(() => {
      setHighlightedOffsets([]);
    }, 2500);
  };

  const handleRunTestHarness = () => {
    setActiveTab('terminal');
  };

  // Theme wrapper classes
  let containerBg = 'bg-[#000070]';
  if (theme === 'dark') containerBg = 'bg-gray-950';
  else if (theme === 'paper') containerBg = 'bg-slate-200';

  return (
    <div className={`min-h-screen flex flex-col font-mono text-white ${containerBg} transition-colors duration-150`}>
      {/* Header & DOS Menu Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        onRunTestHarness={handleRunTestHarness}
      />

      {/* Main Work Area */}
      <main className="flex-1 p-3 sm:p-5 max-w-7xl w-full mx-auto space-y-5">
        {activeTab === 'lab' && (
          <div className="space-y-5">
            {/* Interactive Bit-Poking & Live Visualizer */}
            <BitPokeLab
              memory={memory}
              setMemory={setMemory}
              baseOffset={baseOffset}
              segment={segment}
              onTraceUpdate={handleTraceUpdate}
              activeTrace={activeTrace}
            />

            {/* Live 512-Byte Hex / ASCII Memory Inspector */}
            <MemoryInspector
              memory={memory}
              setMemory={setMemory}
              baseOffset={baseOffset}
              segment={segment}
              highlightedOffsets={highlightedOffsets}
            />
          </div>
        )}

        {activeTab === 'code' && <CodeViewer />}

        {activeTab === 'saver-loader' && (
          <div className="space-y-5">
            <SaverLoaderStudio
              memory={memory}
              setMemory={setMemory}
              segment={segment}
              baseOffset={baseOffset}
            />
            {/* Memory inspector to see changes from file load/restore */}
            <MemoryInspector
              memory={memory}
              setMemory={setMemory}
              baseOffset={baseOffset}
              segment={segment}
              highlightedOffsets={highlightedOffsets}
            />
          </div>
        )}

        {activeTab === 'terminal' && <TerminalRunner />}
      </main>

      {/* Classic QuickBASIC 4.5 Status Bar */}
      <footer className="bg-[#c0c0c0] text-black px-3 py-1 text-xs font-mono font-medium border-t border-gray-400 select-none flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center space-x-3 text-[11px] text-gray-900">
          <span className="font-bold text-blue-900">&lt;Shift+F5=Restart&gt;</span>
          <span className="font-bold text-blue-900">&lt;F5=Run Suite&gt;</span>
          <span className="font-bold text-blue-900">&lt;F1=Help&gt;</span>
          <span className="hidden sm:inline text-gray-600">| QBasic 1.1 / QB4.5 / QB64 Compliant</span>
        </div>

        <div className="flex items-center space-x-4 text-[11px] text-gray-800">
          <span>Active Seg: <strong className="text-blue-950 font-bold">&amp;H{segment.toString(16).toUpperCase()}</strong></span>
          <span>Buffer: <strong className="text-blue-950 font-bold">{memory.length} Bytes</strong></span>
          <span className="hidden md:inline">Status: <strong className="text-emerald-800 font-bold">READY</strong></span>
        </div>
      </footer>
    </div>
  );
}
