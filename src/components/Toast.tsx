import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  show: boolean;
  onRun: () => void;
  onClose: () => void;
}

export const Toast = ({ show, onRun, onClose }: ToastProps) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed bottom-10 right-10 z-[100] min-w-[240px]"
      >
        <div className="bg-black/80 border border-white/5 backdrop-blur-xl p-3 pr-4 rounded-lg shadow-2xl flex items-center gap-3 overflow-hidden group">
          <div className="flex-1 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-neon-green" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-white">Code Updated</span>
            </div>
            
            <button 
              onClick={onRun}
              className="text-[10px] bg-white/5 hover:bg-neon-green/20 border border-white/10 hover:border-neon-green/30 text-neon-green px-2 py-0.5 rounded transition-all font-bold uppercase tracking-tighter"
            >
              Run
            </button>
          </div>

          <motion.div 
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: "linear" }}
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-neon-green origin-left"
          />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
