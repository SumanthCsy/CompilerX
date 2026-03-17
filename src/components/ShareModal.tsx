import React, { useState } from 'react';
import { X, Copy, Check, Share2, Mail } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'motion/react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export default function ShareModal({ isOpen, onClose, shareUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: <SiWhatsapp size={20} />,
      color: 'bg-[#25D366] text-white shadow-[0_0_15px_rgba(37,211,102,0.4)]',
      url: `https://wa.me/?text=${encodeURIComponent('Check out my code on CompilerX: ' + shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedin size={20} />,
      color: 'bg-[#0077b5] text-white shadow-[0_0_15px_rgba(0,119,181,0.4)]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Email',
      icon: <Mail size={20} />,
      color: 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]',
      url: `mailto:?subject=CompilerX Code Snippet&body=${encodeURIComponent('Check out my code on CompilerX: ' + shareUrl)}`
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-cyber-panel border border-cyber-border rounded-xl shadow-2xl overflow-hidden p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Share2 size={18} className="text-neon-cyan" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                  SHARE A COPY
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-white transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Link Input Field */}
            <div className="relative mb-8 group">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-black/60 border border-cyber-border rounded-lg px-4 py-3 text-xs text-gray-400 font-mono pr-12 focus:outline-none group-hover:border-neon-cyan/30 transition-all"
              />
              <button
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neon-cyan hover:bg-neon-cyan/10 rounded-md transition-all"
                title="Copy Link"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center justify-center gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${social.color}`}
                  title={`Share via ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Bottom Glow */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-neon-cyan/10 blur-[50px] pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
