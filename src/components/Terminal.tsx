import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Trash2, StopCircle, Sparkles } from 'lucide-react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io, Socket } from 'socket.io-client';
import { FileNode } from '../types';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  activeFile: FileNode | null;
  runTrigger: number;
  onExecutionStart: () => void;
  onExecutionEnd: () => void;
  isExecuting: boolean;
  onFixError?: (error: string) => void;
}

export default function Terminal({ activeFile, runTrigger, onExecutionStart, onExecutionEnd, isExecuting, onFixError }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isTermReady, setIsTermReady] = useState(false);
  const [lastOutput, setLastOutput] = useState('');
  const [hasExited, setHasExited] = useState(false);

  // Initialize Terminal
  useEffect(() => {
    if (!terminalRef.current) return;
    
    const xterm = new XTerm({
      theme: {
        background: '#0a0a0c',
        foreground: '#e5e7eb',
        cursor: '#00f3ff',
        cursorAccent: '#00f3ff',
        selectionBackground: 'rgba(0, 255, 159, 0.3)',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 14,
      cursorBlink: true,
      convertEol: true, // Handle \n correctly across OS
    });
    
    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(terminalRef.current);
    
    // Slight delay to ensure DOM is ready for fit
    setTimeout(() => {
      fitAddon.fit();
      setIsTermReady(true);
      xterm.writeln('\x1b[38;2;0;255;159m➜\x1b[0m \x1b[38;2;0;243;255m~\x1b[0m Ready for execution. Press Run to start.');
    }, 100);
    
    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    const handleResize = () => {
      if (fitAddonRef.current) fitAddonRef.current.fit();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      xterm.dispose();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Handle Execution
  useEffect(() => {
    if (runTrigger === 0 || !activeFile) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(window.location.origin);
    socketRef.current = socket;
    
    const xterm = xtermRef.current;
    if (!xterm) return;

    xterm.clear();
    xterm.writeln('\x1b[1m\x1b[38;2;0;255;159m>_ \x1b[38;2;255;255;255mExecuting \x1b[38;2;0;243;255m' + activeFile.name + '\x1b[0m\r\n');
    onExecutionStart();
    setLastOutput('');
    setHasExited(false);

    socket.emit('run', {
      language: activeFile.language,
      files: [{ name: activeFile.name, content: activeFile.content }]
    });

    const dataDisposable = xterm.onData(data => {
      socket.emit('data', data);
    });

    socket.on('data', (data) => {
      xterm.write(data);
      setLastOutput(prev => (prev + data).slice(-2000)); // Keep last 2KB
    });

    socket.on('exit', ({ exitCode }) => {
      xterm.writeln(`\r\n\x1b[1m\x1b[90m[Process exited with code ${exitCode}]\x1b[0m`);
      dataDisposable.dispose();
      socket.disconnect();
      socketRef.current = null;
      onExecutionEnd();
      setHasExited(true);
    });

    return () => {
      dataDisposable.dispose();
    };

  }, [runTrigger]);

  const handleClear = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.writeln('\x1b[38;2;0;255;159m➜\x1b[0m \x1b[38;2;0;243;255m~\x1b[0m Terminal cleared.');
    }
  };

  const stopExecution = () => {
    if (socketRef.current) {
      socketRef.current.emit('kill');
    }
  };

  return (
    <div className="h-64 md:h-1/3 min-h-[16rem] bg-cyber-panel border-t border-cyber-border flex flex-col overflow-hidden relative">
      <div className="px-4 py-2 border-b border-cyber-border flex justify-between items-center bg-black/40 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
            <TerminalIcon size={14} className="text-neon-green" />
            Terminal
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isExecuting && (
            <>
              <div className="flex items-center gap-2 text-[10px] text-neon-cyan animate-pulse">
                <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(0,243,255,0.8)]" />
                RUNNING
              </div>
              <button
                onClick={stopExecution}
                className="p-1 hover:bg-white/10 rounded text-red-500 transition-colors"
                title="Stop Process"
              >
                <StopCircle size={14} />
              </button>
            </>
          )}
          {hasExited && onFixError && (
            <button
              onClick={() => onFixError(lastOutput)}
              className="flex items-center gap-1.5 px-2 py-1 bg-neon-purple/10 hover:bg-neon-purple/20 border border-neon-purple/30 rounded text-[10px] font-bold uppercase tracking-widest text-neon-purple transition-all group"
              title="Fix with AI"
            >
              <Sparkles size={12} className="group-hover:animate-pulse" />
              Fix with AI
            </button>
          )}
          <button
            onClick={handleClear}
            className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-neon-pink transition-colors"
            title="Clear Console"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full relative overflow-hidden bg-[#0a0a0c] p-2 flex">
        <div ref={terminalRef} className="flex-1 w-full h-full terminal-container" />
      </div>
    </div>
  );
}
