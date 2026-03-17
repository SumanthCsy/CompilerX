import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/Editor';
import Terminal from './components/Terminal';
import AIChat from './components/AIChat';
import { FileNode, ExecutionResult } from './types';
import { DEFAULT_FILES, SUPPORTED_LANGUAGES, LANGUAGE_VERSIONS } from './constants';
import axios from 'axios';
import { CheckCircle, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import LandingPage from './components/LandingPage';
import { FloatingParticles } from './components/FloatingParticles';
import { Toast } from './components/Toast';
import ShareModal from './components/ShareModal';

const getLanguageFromExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mapping: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'h': 'cpp',
    'html': 'html',
    'css': 'css',
    'md': 'markdown',
    'json': 'json'
  };
  return mapping[ext] || 'javascript';
};

import { Routes, Route, useNavigate } from 'react-router-dom';

const TypingText = () => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const phrases = ["CompilerX", "X = Extreme"];

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];

      setText(isDeleting
        ? fullText.substring(0, text.length - 1)
        : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 50 : 150);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(500);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <div className="flex items-center font-mono">
      <span className="text-neon-cyan opacity-80 mr-1">{'> '}</span>
      <span className="text-white/40">system.log</span>
      <span className="text-gray-600">(</span>
      <span className="text-neon-green/60 font-black tracking-widest">"{text}"</span>
      <span className="text-gray-600">)</span>
      <span className="ml-1 w-1 h-3 bg-neon-cyan/50 animate-pulse" />
    </div>
  );
};

export default function App() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileNode[]>(() => {
    const saved = localStorage.getItem('compilerx_files');
    return saved ? JSON.parse(saved) : DEFAULT_FILES;
  });
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id || '');
  const [runTrigger, setRunTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [stdin, setStdin] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState('');

  const handleStartEditor = () => {
    sessionStorage.setItem('compilerx_started', 'true');
    navigate('/editor');
  };

  const activeFile = files.find(f => f.id === activeFileId) || null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    if (shareId) {
      navigate('/editor'); // Switch to editor if sharing
      fetch(`/api/share/${shareId}`)
        .then(res => res.json())
        .then(data => {
          if (data.files && data.files.length > 0) {
            setFiles(data.files);
            setActiveFileId(data.files[0].id);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch(err => console.error("Failed to load shared snippet", err));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('compilerx_files', JSON.stringify(files));
  }, [files]);

  const handleCodeChange = (newContent: string | undefined) => {
    if (newContent === undefined) return;
    setFiles(prev => prev.map(f =>
      f.id === activeFileId ? { ...f, content: newContent } : f
    ));
  };

  const handleFileSelect = (id: string) => {
    setActiveFileId(id);
  };

  const handleFileClose = (id: string) => {
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id && newFiles.length > 0) {
      setActiveFileId(newFiles[0].id);
    } else if (newFiles.length === 0) {
      setActiveFileId('');
    }
  };

  const handleFileCreate = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const newFile: FileNode = {
      id,
      name: `untitled_${files.length + 1}.js`,
      content: '// New cyberpunk script\n',
      language: 'javascript',
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(id);
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const content = await file.text();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
      let lang = 'javascript';

      const extsToLang: Record<string, string> = {
        'js': 'javascript', 'ts': 'typescript', 'py': 'python',
        'cpp': 'cpp', 'c': 'cpp', 'java': 'java', 'html': 'html',
        'css': 'css', 'json': 'json', 'md': 'markdown'
      };
      if (extsToLang[ext]) lang = extsToLang[ext];

      const id = Math.random().toString(36).substr(2, 9);
      const newFile: FileNode = {
        id,
        name: file.name,
        content,
        language: lang,
      };

      setFiles(prev => [...prev, newFile]);
      setActiveFileId(id);
    };
    input.click();
  };

  const handleFilesDownload = (ids: string[]) => {
    ids.forEach(id => {
      const file = files.find(f => f.id === id);
      if (file) {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const handleFilesShare = async (ids: string[]) => {
    const selectedFiles = files.filter(f => ids.includes(f.id));
    if (selectedFiles.length === 0) return;

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: selectedFiles })
      });
      const data = await res.json();

      if (data.id) {
        const shareUrl = `${window.location.origin}/editor?share=${data.id}`;
        setCurrentShareUrl(shareUrl);
        setIsShareModalOpen(true);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error('Error sharing', err);
      alert('Failed to generate sharing transmission. Check backend connection.');
    }
  };

  const handleAskAI = (code: string) => {
    setIsAIChatOpen(true);
    if (code) {
      setAiQuery(`Can you explain or improve this code snippet?\n\`\`\`\n${code}\n\`\`\``);
    } else {
      setAiQuery("Can you help me with my code?");
    }
  };

  const handleFileRename = (id: string, newName: string) => {
    const newLang = getLanguageFromExtension(newName);
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, name: newName, language: newLang } : f
    ));
  };

  const handleLanguageChange = (lang: string) => {
    if (!activeFile) return;
    const ext = SUPPORTED_LANGUAGES[lang] || 'txt';
    const newName = activeFile.name.split('.')[0] + '.' + ext;
    setFiles(prev => prev.map(f =>
      f.id === activeFileId ? { ...f, language: lang, name: newName } : f
    ));
  };

  const runCode = async () => {
    if (!activeFile || isExecuting) return;
    setRunTrigger(trigger => trigger + 1);
  };

  const handleSave = () => {
    console.log("Project saved to local storage");
  };

  const handleDownload = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyAICode = (code: string) => {
    handleCodeChange(code);
    const audio = new Audio('/popup.mp3');
    audio.play().catch(e => console.log('Audio play blocked:', e));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleFixError = (error: string) => {
    setIsAIChatOpen(true);
    setAiQuery(`I encountered this execution error. Can you find and fix the issue in the code?\n\nError:\n\`\`\`\n${error}\n\`\`\``);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, isExecuting]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={window.location} key={window.location.pathname}>
        <Route path="/" element={
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="min-h-screen w-full"
          >
            <LandingPage onStart={handleStartEditor} />
          </motion.div>
        } />
        <Route path="/editor" element={
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col min-h-screen md:h-screen overflow-y-auto md:overflow-hidden bg-cyber-bg scanline relative theme-container"
          >
            <FloatingParticles />

            <Navbar
              language={activeFile?.language || 'javascript'}
              onLanguageChange={handleLanguageChange}
              onRun={runCode}
              onSave={handleSave}
              onDownload={handleDownload}
              isRunning={isExecuting}
              onToggleAI={() => setIsAIChatOpen(!isAIChatOpen)}
              isAIOpen={isAIChatOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onUpload={handleFileUpload}
            />

            <div className="flex-1 flex overflow-hidden relative">
              <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 absolute md:relative z-30 h-full`}>
                <Sidebar
                  files={files}
                  activeFileId={activeFileId}
                  onFileSelect={(id) => {
                    handleFileSelect(id);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  onFileClose={handleFileClose}
                  onFileCreate={handleFileCreate}
                  onFileRename={handleFileRename}
                  onFileUpload={handleFileUpload}
                  onFilesDownload={handleFilesDownload}
                  onFilesShare={handleFilesShare}
                />
              </div>

              <main className="flex-1 flex flex-col min-w-0 border-r border-cyber-border relative">
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 min-h-0">
                    <CodeEditor
                      file={activeFile}
                      onChange={handleCodeChange}
                      onAskAI={handleAskAI}
                    />
                  </div>
                  <Terminal
                    activeFile={activeFile}
                    runTrigger={runTrigger}
                    onExecutionStart={() => setIsExecuting(true)}
                    onExecutionEnd={() => setIsExecuting(false)}
                    isExecuting={isExecuting}
                    onFixError={handleFixError}
                  />
                </div>
              </main>

              <div
                className={`${isAIChatOpen ? 'w-full md:w-80 translate-x-0 opacity-100' : 'w-0 translate-x-full md:translate-x-0 opacity-0'} transition-all duration-300 fixed md:relative right-0 top-0 bottom-0 z-40 h-full flex-shrink-0 bg-cyber-bg/95 md:bg-transparent overflow-hidden border-l border-cyber-border`}
                style={{ pointerEvents: isAIChatOpen ? 'auto' : 'none' }}
              >
                <div className="w-screen md:w-80 h-full absolute right-0">
                  <AIChat
                    activeFile={activeFile}
                    onApplyCode={(code) => {
                      applyAICode(code);
                      if (window.innerWidth < 768) setIsAIChatOpen(false);
                    }}
                    onClose={() => setIsAIChatOpen(false)}
                    initialQuery={aiQuery}
                    onClearQuery={() => setAiQuery('')}
                  />
                </div>
              </div>
            </div>

            <Toast
              show={showToast}
              onRun={() => {
                runCode();
                setShowToast(false);
              }}
              onClose={() => setShowToast(false)}
            />

            <footer className="h-6 bg-cyber-panel border-t border-cyber-border px-4 flex items-center justify-between text-[10px] text-gray-500 font-mono">
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neon-cyan/60 font-black tracking-widest uppercase text-[8px] mr-2">Status:</span>
                  <TypingText />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://sumanthcsy.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon-cyan/50 hover:text-neon-cyan transition-colors"
                >
                  Developed by @Sumanth Csy
                </a>
                <span className="text-gray-600">LN {activeFile?.content.split('\n').length || 0}, COL 1</span>
              </div>
            </footer>

            <ShareModal 
              isOpen={isShareModalOpen} 
              onClose={() => setIsShareModalOpen(false)} 
              shareUrl={currentShareUrl} 
            />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
}
