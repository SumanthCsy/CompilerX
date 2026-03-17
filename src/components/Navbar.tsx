import React from 'react';
import { Cpu, Play, Save, Download, Terminal, Settings, Globe, MessageSquare, X, Menu, Upload } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { SiJavascript, SiTypescript, SiPython, SiCplusplus, SiC, SiHtml5, SiCss, SiMarkdown, SiJson } from 'react-icons/si';
import { FaJava } from 'react-icons/fa';

interface NavbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  onRun: () => void;
  onSave: () => void;
  onDownload: () => void;
  isRunning: boolean;
  onToggleAI: () => void;
  isAIOpen: boolean;
  onToggleSidebar?: () => void;
  onUpload?: () => void;
}

export default function Navbar({ 
  language, 
  onLanguageChange, 
  onRun, 
  onSave, 
  onDownload, 
  isRunning,
  onToggleAI,
  isAIOpen,
  onToggleSidebar,
  onUpload
}: NavbarProps) {

  const getLanguageIcon = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'javascript': case 'js': return <SiJavascript size={14} className="text-neon-cyan pointer-events-none" />;
      case 'typescript': case 'ts': return <SiTypescript size={14} className="text-[#3178c6] pointer-events-none" />;
      case 'python': case 'py': return <SiPython size={14} className="text-[#ffeb3b] pointer-events-none" />;
      case 'cpp': return <SiCplusplus size={14} className="text-[#00599C] pointer-events-none" />;
      case 'c': return <SiC size={14} className="text-[#A8B9CC] pointer-events-none" />;
      case 'java': return <FaJava size={14} className="text-[#b07219] pointer-events-none" />;
      case 'html': return <SiHtml5 size={14} className="text-[#e34c26] pointer-events-none" />;
      case 'css': return <SiCss size={14} className="text-[#264de4] pointer-events-none" />;
      case 'markdown': case 'md': return <SiMarkdown size={14} className="text-white pointer-events-none" />;
      case 'json': return <SiJson size={14} className="text-[#cb3837] pointer-events-none" />;
      default: return <SiJavascript size={14} className="text-neon-cyan pointer-events-none" />; 
    }
  };

  return (
    <nav className="h-14 bg-cyber-panel border-b border-cyber-border flex items-center justify-between px-2 md:px-6 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 md:gap-8">
        <div className="flex items-center gap-2 md:gap-3">
          {onToggleSidebar && (
            <button 
              onClick={onToggleSidebar}
              className="p-1.5 md:hidden text-gray-400 hover:text-white transition-colors"
            >
              <Menu size={20} />
            </button>
          )}
          
          <div className="flex items-center gap-2 pr-2">
            <img 
              src="/compilerx_logo.png" 
              alt="CompilerX Logo" 
              className="h-6 md:h-8 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-sm md:text-xl font-black tracking-tight text-white leading-none font-sans">
                Compiler<span className="text-[#0ea5e9]">X</span>
              </span>
              <span className="text-[7px] md:text-[9px] text-gray-400 font-bold tracking-widest uppercase mt-0.5 ml-0.5">
                Online IDE
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-1">
          <div className="relative group shrink-0">
            <div className="absolute -inset-0.5 bg-neon-cyan/20 rounded-md blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="relative bg-black/40 border border-cyber-border text-[10px] md:text-xs text-gray-300 px-2 md:px-3 pl-7 md:pl-8 py-1 md:py-1.5 rounded-md focus:outline-none focus:border-neon-cyan/50 cursor-pointer font-mono appearance-none"
            >
              {Object.keys(SUPPORTED_LANGUAGES).map(lang => (
                <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
              ))}
            </select>
            <div className="absolute left-2 md:left-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {getLanguageIcon(language)}
            </div>
          </div>

          <button
            onClick={onRun}
            disabled={isRunning}
            className={`
              relative group flex items-center gap-1 md:gap-2 px-2 md:px-5 py-1 md:py-1.5 rounded-md font-bold text-[9px] md:text-xs uppercase tracking-widest transition-all shrink-0
              ${isRunning 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-neon-green text-black hover:shadow-[0_0_20px_rgba(0,255,159,0.6)] active:scale-95'}
            `}
          >
            <Play size={10} fill="currentColor" />
            <span className="">{isRunning ? '...' : 'Run'}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar pl-2">
        <button 
          onClick={onToggleAI}
          className={`p-2 rounded-md transition-all flex items-center gap-2 ${isAIOpen ? 'bg-neon-pink/20 text-neon-pink' : 'text-gray-400 hover:text-neon-pink hover:bg-neon-pink/10'}`}
          title="Toggle AI Assistant"
        >
          {isAIOpen ? <X size={18} /> : <MessageSquare size={18} />}
          <span className="text-[10px] font-bold uppercase tracking-tighter hidden md:inline">AI Assistant</span>
        </button>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <button 
            onClick={onSave}
            className="p-1.5 md:p-2 text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-md transition-all"
            title="Save Project"
          >
            <Save size={16} />
          </button>
          <button 
            onClick={onUpload}
            className="p-1.5 md:p-2 text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-md transition-all"
            title="Upload File"
          >
            <Upload size={16} />
          </button>
          <button 
            onClick={onDownload}
            className="p-1.5 md:p-2 text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-md transition-all"
            title="Download File"
          >
            <Download size={16} />
          </button>
        </div>

        <div className="h-6 w-[1px] bg-cyber-border mx-1 hidden md:block" />
        
        <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-cyber-border">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 font-mono">SYSTEM_STATUS</span>
            <span className="text-[10px] text-neon-green font-mono">ONLINE</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_rgba(0,255,159,0.8)] animate-pulse" />
        </div>
      </div>
    </nav>
  );
}
