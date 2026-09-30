import React from 'react';
import { Download, Copy, Play, Monitor, Moon, Sun, Check, Cpu } from 'lucide-react';
import { getFullQBasicCode } from '../utils/qbasicCode';

interface HeaderProps {
  activeTab: 'lab' | 'code' | 'saver-loader' | 'terminal';
  setActiveTab: (tab: 'lab' | 'code' | 'saver-loader' | 'terminal') => void;
  theme: 'dos' | 'dark' | 'paper';
  setTheme: (theme: 'dos' | 'dark' | 'paper') => void;
  onRunTestHarness: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  onRunTestHarness,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyFullCode = () => {
    const code = getFullQBasicCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBas = () => {
    const code = getFullQBasicCode();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BITPOKE.BAS';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="border-b select-none transition-colors duration-150 shadow-sm border-blue-900/60 bg-[#0000a8] text-white">
      {/* DOS Menu Bar Style */}
      <div className="bg-[#c0c0c0] text-black px-3 py-1 flex items-center justify-between text-xs font-mono font-medium tracking-wide border-b border-gray-400">
        <div className="flex items-center space-x-4">
          <span className="font-bold flex items-center gap-1.5 text-blue-950">
            <Cpu className="w-4 h-4 text-blue-800" />
            <span>QBASIC 4.5 MEMORY &amp; BITSTREAM LAB</span>
          </span>
          <div className="hidden sm:flex space-x-3 text-gray-800">
            <span className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer">File</span>
            <span className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer">Edit</span>
            <span className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer">View</span>
            <span className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer">Search</span>
            <span
              onClick={onRunTestHarness}
              className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer font-bold text-blue-900"
              title="Run Verification Tests"
            >
              Run (F5)
            </span>
            <span className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer">Debug</span>
            <span className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer">Options</span>
            <span className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer">Help</span>
          </div>
        </div>

        {/* Theme and Quick Actions */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center rounded bg-gray-200 border border-gray-400 p-0.5 text-[11px]">
            <button
              onClick={() => setTheme('dos')}
              className={`px-1.5 py-0.5 rounded transition ${
                theme === 'dos' ? 'bg-blue-900 text-white font-bold' : 'text-gray-700 hover:text-black'
              }`}
              title="Classic DOS Blue Screen"
            >
              DOS Blue
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-1.5 py-0.5 rounded transition ${
                theme === 'dark' ? 'bg-gray-800 text-cyan-300 font-bold' : 'text-gray-700 hover:text-black'
              }`}
              title="Modern Dark Cyber IDE"
            >
              Dark IDE
            </button>
            <button
              onClick={() => setTheme('paper')}
              className={`px-1.5 py-0.5 rounded transition ${
                theme === 'paper' ? 'bg-white text-gray-900 font-bold shadow-xs' : 'text-gray-700 hover:text-black'
              }`}
              title="Clean High-Contrast Paper"
            >
              Paper
            </button>
          </div>
        </div>
      </div>

      {/* Main Title and Action Bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 bg-[#0000a8] border-b border-blue-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-yellow-400 flex items-center justify-center text-blue-950 font-black text-sm shadow-inner">
            QB
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>QBasic 1-to-32 Bit Memory POKE / PEEK &amp; Saver/Loader</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                1-Bit ~ 32-Bit
              </span>
            </h1>
            <p className="text-xs text-blue-200/90 font-mono">
              DEF SEG · POKE · PEEK · BSAVE · BLOAD · Continuous Bitstreams · Binary File I/O
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onRunTestHarness}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-mono font-bold transition shadow-sm cursor-pointer"
            title="Execute simulated QBasic test suite in the virtual terminal"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RUN TESTS</span>
          </button>

          <button
            onClick={handleCopyFullCode}
            className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 border border-blue-400/30 text-white px-2.5 py-1.5 rounded text-xs font-mono transition shadow-sm cursor-pointer"
            title="Copy full BITPOKE.BAS to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED!' : 'COPY .BAS'}</span>
          </button>

          <button
            onClick={handleDownloadBas}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1.5 rounded text-xs font-mono font-bold transition shadow-sm cursor-pointer"
            title="Download BITPOKE.BAS source file ready for QuickBASIC / QB64"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD .BAS</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 flex space-x-1 text-xs font-mono bg-[#000080] border-t border-blue-700/50 overflow-x-auto">
        <button
          onClick={() => setActiveTab('lab')}
          className={`px-3 py-2 border-b-2 font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'lab'
              ? 'border-yellow-300 text-yellow-300 bg-blue-900/60'
              : 'border-transparent text-blue-200 hover:text-white hover:bg-blue-800/40'
          }`}
        >
          <span>1. Interactive Bit POKE Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`px-3 py-2 border-b-2 font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'code'
              ? 'border-yellow-300 text-yellow-300 bg-blue-900/60'
              : 'border-transparent text-blue-200 hover:text-white hover:bg-blue-800/40'
          }`}
        >
          <span>2. QBasic Code Generator (.BAS)</span>
        </button>

        <button
          onClick={() => setActiveTab('saver-loader')}
          className={`px-3 py-2 border-b-2 font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'saver-loader'
              ? 'border-yellow-300 text-yellow-300 bg-blue-900/60'
              : 'border-transparent text-blue-200 hover:text-white hover:bg-blue-800/40'
          }`}
        >
          <span>3. BSAVE &amp; BLOAD Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-3 py-2 border-b-2 font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'terminal'
              ? 'border-yellow-300 text-yellow-300 bg-blue-900/60'
              : 'border-transparent text-blue-200 hover:text-white hover:bg-blue-800/40'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>4. Simulated DOS Runner</span>
        </button>
      </div>
    </header>
  );
};
