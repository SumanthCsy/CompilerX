import React from 'react';
import { motion } from 'motion/react';
import { Code2, Terminal, Sparkles, Zap, Shield, Cpu, Rocket, Bot } from 'lucide-react';
import { FloatingParticles } from './FloatingParticles';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="theme-container min-h-screen w-full flex flex-col items-center justify-center relative bg-grid py-20 md:py-0">
      <FloatingParticles />

      {/* Background Code Symbols */}
      <div className="code-symbol code-symbol-1">{'{}'}</div>
      <div className="code-symbol code-symbol-2">{'</>'}</div>
      <div className="code-symbol code-symbol-3">{'() =>'}</div>
      <div className="code-symbol code-symbol-4">{'[]'}</div>

      {/* Hero Content */}
      <main className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8 md:mb-12"
        >
          <img
            src="/compilerx_logo.png"
            alt="Logo"
            className="w-24 h-24 md:w-32 md:h-32 object-contain relative drop-shadow-[0_0_25px_rgba(0,243,255,0.4)]"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <h1 className="text-6xl md:text-9xl font-black mb-4 tracking-tighter leading-none relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">COMPILER</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-neon-cyan to-blue-600 relative">
              X
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="absolute -bottom-6 right-0 badge-extreme flex items-center gap-1.5 whitespace-nowrap"
              >
                <Rocket size={10} className="fill-white" />
                Extreme
              </motion.div>
            </span>
          </h1>

          <div className="flex items-center justify-center gap-4 mb-16 mt-8">
            <div className="h-px w-8 bg-white/10" />
            <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-[0.5em] opacity-80">
              Code Smarter. Build Faster
            </p>
            <div className="h-px w-8 bg-white/10" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-8"
        >
          <div className="btn-launch-highlight">
            <button
              onClick={onStart}
              className="group px-12 py-5 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[11px] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <div className="flex items-center gap-3">
                <Terminal size={14} className="group-hover:rotate-12 transition-transform" />
                Launch Code Editor
              </div>
            </button>
          </div>

          <div className="glass-card px-10 py-5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 flex items-center gap-4 border-white/5">
            <div className="flex items-center gap-3">
              <Bot size={16} className="text-neon-cyan animate-pulse" />
              AI Integrated
            </div>
          </div>
        </motion.div>

        {/* Floating Feature Icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="hidden md:flex gap-16 mt-24"
        >
          {[
            { icon: <Zap size={20} />, label: "0ms latency" },
            { icon: <Shield size={20} />, label: "Vault Security" },
            { icon: <Cpu size={20} />, label: "Neural Engine" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3 group">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-neon-cyan/10 group-hover:border-neon-cyan/20 group-hover:text-neon-cyan transition-all duration-500">
                {item.icon}
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 group-hover:text-gray-400 transition-colors">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Responsive Footer */}
      <footer className="absolute bottom-10 w-full px-16 z-10 flex flex-col md:flex-row items-center justify-between text-[10px] uppercase tracking-[0.3em] font-black text-gray-600/80">
        <div className="mb-4 md:mb-0">&copy; 2026 CSY TECH</div>
        <div className="flex items-center gap-2">
          Developed by
          <a
            href="https://sumanthcsy.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 px-2 py-0.5 border border-white/10 rounded-md hover:text-neon-cyan hover:border-neon-cyan/30 transition-all cursor-pointer"
          >
            @Sumanth Csy
          </a>
        </div>
      </footer>
    </div>
  );
}
