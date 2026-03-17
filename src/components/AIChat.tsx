import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Code2, X, Key } from 'lucide-react';
import { ChatMessage, FileNode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIChatProps {
  activeFile: FileNode | null;
  onApplyCode: (code: string) => void;
  onClose?: () => void;
  initialQuery?: string;
  onClearQuery?: () => void;
}

export default function AIChat({ activeFile, onApplyCode, onClose, initialQuery, onClearQuery }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm your AI coding assistant. How can I help you with your code today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [revealKey, setRevealKey] = useState(false);
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('compilerx_gemini_key') || '');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('compilerx_gemini_key', userApiKey);
  }, [userApiKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showSettings]);

  useEffect(() => {
    if (initialQuery && !isLoading) {
      handleSend(initialQuery);
      if (onClearQuery) onClearQuery();
    }
  }, [initialQuery]);

  const handleSend = async (override?: string) => {
    const userMsg = override || input.trim();
    if (!userMsg || isLoading) return;

    if (!override) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const apiKey = userApiKey || (import.meta as any).env.VITE_GEMINI_API_KEY || "";

    // Updated System Prompt to match your request (Human Developer, Minimalist, Code-First, Bolds & Emojis)
    const sysPrompt = `You are an expert software developer helping inside an IDE.
Respond like a normal, friendly human developer. 👨‍💻

Guidelines:
- **Use bold text** for emphasis on key terms and instructions.
- **Use appropriate emojis** to make the conversation feel natural (e.g., 🚀, ✅, 🔧, 💡).
- Avoid roleplay (no "operator", "mainframe").
- Keep explanations simple and concise.
- **Always provide code first** if relevant, followed by a short explanation.
- Format code blocks clearly.

Context: The user is currently editing a ${activeFile?.language || 'unknown'} file named "${activeFile?.name || 'untitled'}".
Current code content:
\`\`\`${activeFile?.language || ''}
${activeFile?.content || ''}
\`\`\``;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMsg }] }],
          systemInstruction: {
            parts: [{ text: sysPrompt }]
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "API Error");
      }

      const data = await res.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response. Please try again.";

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMsg = "Sorry, I ran into a technical issue. Please check your API key or connection.";
      if (error.message?.includes("quota")) {
        errorMsg = "Your Gemini API quota is reached. Please wait a moment or check your account limits.";
      }
      setMessages(prev => [...prev, {
        role: 'model',
        text: `ERROR: ${errorMsg}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractCode = (text: string) => {
    const match = text.match(/```[\w]*\n([\s\S]*?)```/);
    return match ? match[1] : null;
  };

  return (
    <div className="w-full md:w-80 bg-cyber-panel border-l border-cyber-border flex flex-col h-full overflow-hidden shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      <div className="p-4 border-b border-cyber-border bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-neon-cyan" />
          <div className="text-xs font-bold uppercase tracking-widest text-neon-cyan">AI Assistant</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1 rounded transition-colors ${showSettings ? 'text-neon-cyan bg-white/5' : 'text-gray-500 hover:text-white'}`}
            title="AI Settings"
          >
            <Key size={16} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="p-4 border-b border-cyber-border bg-black/60 space-y-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-widest text-neon-cyan font-bold">Your Gemini API Key</label>
              {userApiKey && (
                <span className="text-[9px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-1.5 py-0.5 rounded leading-none">
                  IN USE
                </span>
              )}
            </div>
            <div className="flex gap-2 relative">
              <input
                type={revealKey ? "text" : "password"}
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                placeholder="Paste key here..."
                className="flex-1 bg-black/40 border border-cyber-border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-neon-cyan/50 pr-10"
              />
              <button
                onClick={() => setRevealKey(!revealKey)}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-[9px] text-gray-500 hover:text-gray-300 font-bold px-2"
              >
                {revealKey ? 'HIDE' : 'SHOW'}
              </button>
              {userApiKey && (
                <button
                  onClick={() => setUserApiKey('')}
                  className="p-1.5 text-red-500 hover:text-red-400 transition-colors"
                  title="Clear Key"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <p className="text-[9px] text-gray-500">Provided keys are saved in your browser. Leave blank to use system default.</p>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex items-center gap-2 mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-neon-cyan' : 'text-neon-cyan'}`}>
                {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                {msg.role === 'user' ? 'User' : 'CompilerX AI'}
              </div>
              <div className={`
                max-w-[95%] p-3.5 rounded-xl text-[13px] leading-relaxed shadow-2xl transition-all
                ${msg.role === 'user'
                  ? 'bg-neon-cyan/5 border border-neon-cyan/20 text-gray-200'
                  : 'bg-black/40 border border-cyber-border text-gray-300'}
              `}>
                <div className="prose prose-sm prose-invert max-w-none 
                  prose-p:leading-relaxed prose-p:my-2
                  prose-pre:bg-black/60 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-lg
                  prose-code:text-neon-cyan prose-code:bg-neon-cyan/10 prose-code:px-1 prose-code:rounded
                  prose-strong:text-white prose-strong:font-bold
                  prose-ul:my-2 prose-li:my-0.5
                ">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                      code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline ? (
                          <div className="relative group/code my-3">
                            <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-cyber-panel border border-cyber-border rounded text-[9px] font-bold uppercase tracking-widest text-gray-500 z-10 group-focus-within/code:text-neon-cyan transition-colors">
                              {match ? match[1] : 'code'}
                            </div>
                            <pre className={`${className} !mt-0 !bg-black/60 !border !border-white/5 !rounded-lg p-3 overflow-x-auto`}>
                              <code {...props} className={className}>
                                {children}
                              </code>
                            </pre>
                          </div>
                        ) : (
                          <code className="bg-white/10 text-neon-cyan px-1.5 py-0.5 rounded text-[12px] font-mono" {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>

                {msg.role === 'model' && extractCode(msg.text) && (
                  <button
                    onClick={() => onApplyCode(extractCode(msg.text)!)}
                    className="mt-3 w-full py-1.5 px-2 bg-neon-cyan/20 hover:bg-neon-cyan/40 border border-neon-cyan/40 rounded text-[10px] font-bold uppercase tracking-widest text-neon-cyan transition-all flex items-center justify-center gap-2"
                  >
                    <Code2 size={12} />
                    Apply to Editor
                  </button>
                )}

                {msg.isError && (
                  <button
                    onClick={() => setShowSettings(true)}
                    className="mt-3 w-full py-1.5 px-2 bg-neon-cyan/20 hover:bg-neon-cyan/40 border border-neon-cyan/40 rounded text-[10px] font-bold uppercase tracking-widest text-neon-cyan transition-all flex items-center justify-center gap-2"
                  >
                    <Key size={12} />
                    Update API Key
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-neon-cyan animate-pulse"
          >
            <Loader2 size={14} className="animate-spin" />
            <span className="text-[10px] uppercase tracking-widest">Processing...</span>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t border-cyber-border bg-black/20">
        <div className="relative group">
          <div className="absolute -top-3 left-3 px-1.5 py-0.5 bg-cyber-panel border border-cyber-border rounded text-[9px] font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-neon-cyan group-focus-within:border-neon-cyan/50 transition-colors z-10">
            Gemini 2.5 Flash
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask AI for help..."
            className="w-full bg-black/40 border border-cyber-border rounded-lg p-3 pr-10 text-sm focus:outline-none focus:border-neon-cyan/50 transition-all resize-none h-20 placeholder:text-gray-600"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="absolute bottom-3 right-3 p-1.5 text-neon-cyan hover:text-white disabled:text-gray-700 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
