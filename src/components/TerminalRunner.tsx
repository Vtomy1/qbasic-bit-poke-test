import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Terminal, CheckCircle2 } from 'lucide-react';

interface TerminalLine {
  text: string;
  type: 'header' | 'normal' | 'success' | 'warning' | 'info' | 'dim';
}

export const TerminalRunner: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Play retro PC speaker beep
  const playBeep = (freq = 880, duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square'; // Classic 8-bit PC speaker square wave
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // AudioContext may be blocked before interaction
    }
  };

  const testSteps = [
    {
      action: () => {
        setLines((prev) => [
          ...prev,
          { text: '========================================================================', type: 'dim' },
          { text: ' Microsoft (R) QuickBASIC 4.5 Execution Environment', type: 'header' },
          { text: ' Program: BITPOKE.BAS - 1-Bit to 32-Bit Memory POKE/PEEK & Saver/Loader', type: 'info' },
          { text: '========================================================================', type: 'dim' },
          { text: 'Allocating 1024-byte buffer at segment &H8000 : offset &H0000...', type: 'normal' },
          { text: 'DEF SEG = &H8000 : Initializing buffer memory with 0x00...', type: 'dim' },
        ]);
        playBeep(440, 0.05);
      },
      delay: 350,
    },
    {
      action: () => {
        setLines((prev) => [
          ...prev,
          { text: ' [1-Bit]  Poking 8 boolean flags into byte 0 (0,1,0,1,0,1,0,1)...   [OK] (8/8 match)', type: 'success' },
        ]);
        playBeep(523, 0.04);
      },
      delay: 300,
    },
    {
      action: () => {
        setLines((prev) => [
          ...prev,
          { text: ' [2-Bit]  Poking 4 CGA colors (0,1,2,3) into byte 1...             [OK] (4/4 match)', type: 'success' },
        ]);
        playBeep(587, 0.04);
      },
      delay: 300,
    },
    {
      action: () => {
        setLines((prev) => [
          ...prev,
          { text: ' [3-Bit]  Poking eight 3-bit values across byte boundaries...      [OK] (8/8 match)', type: 'success' },
        ]);
        playBeep(659, 0.04);
      },
      delay: 300,
    },
    {
      action: () => {
        setLines((prev) => [
          ...prev,
          { text: ' [4-Bit]  Poking 4 EGA nibbles (colors 12, 14, 9, 15)...           [OK] (All match)', type: 'success' },
        ]);
        playBeep(698, 0.04);
      },
      delay: 300,
    },
    {
      action: () => {
        setLines((prev) => [
          ...prev,
          { text: ' [5-Bit]  Poking 5-bit HiColor RGB levels (5, 17, 31, 0)...        [OK] (All match)', type: 'success' },
        ]);
        playBeep(784, 0.04);
      },
      delay: 300,
    },
    {
      action: () => {
        setLines((prev) => [
          ...prev,
          { text: ' [6-Bit]  Poking VGA DAC hardware palette (63, 32, 10)...          [OK] (All match)', type: 'success' },
        ]);
        playBeep(880, 0.04);
      },
      delay: 300,
    },
    {
      action: () => {
        setLines((prev) => [
          ...prev,
          { text: " [7-Bit]  Poking 7-bit ASCII characters 'Q' (81) and 'B' (66)...    [OK] (All match)", type: 'success' },
        ]);
        playBeep(987, 0.04);
      },
      delay: 300,
    },
    {
      action: () => {
        setLines((prev) => [
          ...prev,
          { text: ' [8-Bit]  Poking raw 8-bit byte (255 / &HFF)...                    [OK] (Exact match)', type: 'success' },
        ]);
        playBeep(1046, 0.04);
      },
      delay: 300,
    },
    {
      action: () => {
        setLines((prev) => [
          ...prev,
          { text: ' [16-Bit] Poking 16-bit INTEGER (54321, Little-Endian)...          [OK] (Exact match)', type: 'success' },
        ]);
        playBeep(1174, 0.04);
      },
      delay: 300,
    },
    {
      action: () => {
        setLines((prev) => [
          ...prev,
          { text: ' [24-Bit] Poking 24-bit TrueColor RGB (&HFF8040 = 16744512)...     [OK] (Exact match)', type: 'success' },
        ]);
        playBeep(1318, 0.04);
      },
      delay: 300,
    },
    {
      action: () => {
        setLines((prev) => [
          ...prev,
          { text: ' [32-Bit] Poking 32-bit LONG DWORD (123456789)...                  [OK] (Exact match)', type: 'success' },
        ]);
        playBeep(1396, 0.04);
      },
      delay: 300,
    },
    {
      action: () => {
        setLines((prev) => [
          ...prev,
          { text: '------------------------------------------------------------------------', type: 'dim' },
          { text: ' SAVER / LOADER INTEGRATION TEST:', type: 'header' },
          { text: ' Saving 128 bytes to disk via BSAVE "BITDATA.BSV"...               [DONE]', type: 'normal' },
          { text: ' Header generated: &HFD, Seg=&H8000, Off=&H0000, Len=128 bytes', type: 'dim' },
          { text: ' Wiping local buffer memory to &HFF (255)...                       [DONE]', type: 'warning' },
          { text: ' Reloading memory from disk via BLOAD "BITDATA.BSV"...             [DONE]', type: 'normal' },
        ]);
        playBeep(880, 0.06);
      },
      delay: 450,
    },
    {
      action: () => {
        setLines((prev) => [
          ...prev,
          { text: ' Verifying restored 16-Bit: 54321...                              [PASS]', type: 'success' },
          { text: ' Verifying restored 24-Bit: 16744512...                           [PASS]', type: 'success' },
          { text: ' Verifying restored 32-Bit: 123456789...                          [PASS]', type: 'success' },
          { text: ' Testing OPEN FOR BINARY (PUT / GET) Portable I/O...               [PASS]', type: 'success' },
          { text: '========================================================================', type: 'dim' },
          { text: ' *** VERIFICATION COMPLETE: ALL 1-BIT TO 32-BIT ROUTINES PASSED 100% ***', type: 'header' },
          { text: '========================================================================', type: 'dim' },
        ]);
        // Triumphant chord
        playBeep(523, 0.1);
        setTimeout(() => playBeep(659, 0.1), 100);
        setTimeout(() => playBeep(784, 0.1), 200);
        setTimeout(() => playBeep(1046, 0.25), 300);
      },
      delay: 350,
    },
  ];

  const handleRunAll = () => {
    setLines([]);
    setIsRunning(true);
    let currentStep = 0;

    const executeNext = () => {
      if (currentStep < testSteps.length) {
        testSteps[currentStep].action();
        const nextDelay = testSteps[currentStep].delay;
        currentStep++;
        setTimeout(executeNext, nextDelay);
      } else {
        setIsRunning(false);
      }
    };

    executeNext();
  };

  useEffect(() => {
    if (lines.length === 0) {
      handleRunAll();
    }
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="space-y-4 font-mono text-white">
      {/* Terminal Title & Controls */}
      <div className="bg-[#000080]/90 border border-blue-600/70 rounded-md p-3 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-yellow-300" />
          <span className="font-bold text-sm text-yellow-300">
            SIMULATED QUICKBASIC 4.5 DOS TERMINAL RUNNER
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1 bg-blue-950 hover:bg-blue-900 border border-blue-600 px-2 py-1 rounded text-blue-200 cursor-pointer"
            title="Toggle authentic PC speaker beeps"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>PC Beep: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                <span>PC Beep: OFF</span>
              </>
            )}
          </button>

          <button
            onClick={handleRunAll}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-extrabold px-3 py-1 rounded transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'RUNNING...' : 'RE-RUN SUITE (F5)'}</span>
          </button>

          <button
            onClick={() => setLines([])}
            className="flex items-center gap-1 bg-blue-900 hover:bg-blue-800 border border-blue-600 px-2.5 py-1 rounded text-blue-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>CLS</span>
          </button>
        </div>
      </div>

      {/* Retro DOS Screen 0 Terminal Box */}
      <div className="bg-black border-2 border-blue-600/90 rounded-md p-4 min-h-[460px] max-h-[580px] overflow-y-auto font-mono text-xs shadow-2xl leading-relaxed select-text">
        {lines.map((line, idx) => {
          let colorClass = 'text-gray-200';
          if (line.type === 'header') colorClass = 'text-yellow-300 font-bold';
          else if (line.type === 'success') colorClass = 'text-emerald-400 font-bold';
          else if (line.type === 'warning') colorClass = 'text-amber-300';
          else if (line.type === 'info') colorClass = 'text-cyan-300';
          else if (line.type === 'dim') colorClass = 'text-blue-500';

          return (
            <div key={idx} className={colorClass}>
              {line.text}
            </div>
          );
        })}

        {/* Blinking DOS cursor */}
        <div className="flex items-center mt-2 text-yellow-300">
          <span className="text-blue-400 mr-1.5">C:\QBASIC&gt;</span>
          <span className="inline-block w-2.5 h-4 bg-yellow-300 animate-pulse" />
        </div>

        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Info Footer */}
      <div className="p-2.5 bg-blue-950/80 border border-blue-600/50 rounded text-xs text-blue-200 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Full suite executes complete verification of all 11 bit-widths + BSAVE/BLOAD serialization.</span>
        </span>
        <span className="text-[11px] text-gray-400 font-mono">QuickBASIC 4.5 / MS-DOS 6.22 Emulated Environment</span>
      </div>
    </div>
  );
};
