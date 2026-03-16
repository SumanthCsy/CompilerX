import React, { useState } from 'react';
import { FileNode } from '../types';
import { Plus, X, Folder, Edit2, Upload, Download, Share2, ListChecks } from 'lucide-react';
import { SiJavascript, SiTypescript, SiPython, SiCplusplus, SiC, SiHtml5, SiCss, SiMarkdown, SiJson } from 'react-icons/si';
import { FaJava } from 'react-icons/fa';

interface SidebarProps {
  files: FileNode[];
  activeFileId: string;
  onFileSelect: (id: string) => void;
  onFileClose: (id: string) => void;
  onFileCreate: () => void;
  onFileRename: (id: string, newName: string) => void;
  onFileUpload?: () => void;
  onFilesDownload?: (ids: string[]) => void;
  onFilesShare?: (ids: string[]) => void;
}

export default function Sidebar({ 
  files, activeFileId, onFileSelect, onFileClose, onFileCreate, onFileRename, 
  onFileUpload, onFilesDownload, onFilesShare 
}: SidebarProps) {
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const getLanguageIcon = (lang: string, active: boolean) => {
    const className = active ? 'text-neon-cyan' : 'text-gray-500';
    switch (lang.toLowerCase()) {
      case 'javascript': case 'js': return <SiJavascript size={14} className={className} />;
      case 'python': case 'py': return <SiPython size={14} className={className} />;
      case 'java': return <FaJava size={14} className={className} />;
      case 'c': return <SiC size={14} className={className} />;
      default: return <SiJavascript size={14} className={className} />; 
    }
  };

  const startRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFileId(id);
    setEditingName(currentName);
  };

  const handleRenameSubmit = (id: string) => {
    if (editingName.trim()) {
      onFileRename(id, editingName.trim());
    }
    setEditingFileId(null);
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedDocs);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedDocs(newSet);
  };

  const handleBulkDownload = () => {
    if (onFilesDownload && selectedDocs.size > 0) {
      onFilesDownload(Array.from(selectedDocs));
      setSelectedDocs(new Set());
    }
  };

  const handleBulkShare = () => {
    if (onFilesShare && selectedDocs.size > 0) {
      onFilesShare(Array.from(selectedDocs));
      setSelectedDocs(new Set());
    }
  };

  return (
    <div className="w-64 bg-cyber-panel border-r border-cyber-border flex flex-col h-full overflow-hidden">
      <div className="p-4 border-bottom border-cyber-border flex justify-between items-center bg-black/20">
        <div className="flex items-center gap-2 text-neon-cyan font-bold text-xs uppercase tracking-widest">
          <Folder size={14} />
          Explorer
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              if (isSelectionMode) setSelectedDocs(new Set());
            }}
            className={`p-1 rounded transition-colors ${isSelectionMode ? 'text-neon-cyan bg-neon-cyan/20' : 'text-gray-400 hover:bg-white/10 hover:text-neon-cyan'}`}
            title="Select Files"
          >
            <ListChecks size={16} />
          </button>
          {onFileUpload && (
            <button 
              onClick={onFileUpload}
              className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-neon-cyan"
              title="Upload File"
            >
              <Upload size={16} />
            </button>
          )}
          <button 
            onClick={onFileCreate}
            className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-neon-green"
            title="New File"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      {selectedDocs.size > 0 && (
        <div className="bg-neon-cyan/10 p-2 flex items-center justify-between border-b border-cyber-border">
          <span className="text-[10px] text-neon-cyan uppercase font-bold tracking-widest px-2">
            {selectedDocs.size} Selected
          </span>
          <div className="flex items-center gap-2">
            <button onClick={handleBulkShare} className="text-gray-400 hover:text-neon-pink transition-colors p-1" title="Share Selected">
              <Share2 size={14} />
            </button>
            <button onClick={handleBulkDownload} className="text-gray-400 hover:text-neon-green transition-colors p-1" title="Download Selected">
              <Download size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-2">
        {files.map(file => (
          <div
            key={file.id}
            onClick={() => {
              if (editingFileId !== file.id) onFileSelect(file.id);
            }}
            className={`
              group flex items-center justify-between px-4 py-1.5 cursor-pointer transition-all
              ${activeFileId === file.id ? 'bg-neon-cyan/10 border-l-2 border-neon-cyan text-white' : 'border-l-2 border-transparent hover:bg-white/5 text-gray-400'}
            `}
          >
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              {isSelectionMode && (
                <input 
                  type="checkbox" 
                  checked={selectedDocs.has(file.id)}
                  onChange={() => {}}
                  onClick={(e) => toggleSelect(file.id, e)}
                  className="w-3 h-3 accent-neon-cyan cursor-pointer"
                />
              )}
              {getLanguageIcon(file.language || 'javascript', activeFileId === file.id)}
              
              {editingFileId === file.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit(file.id);
                    if (e.key === 'Escape') setEditingFileId(null);
                  }}
                  onBlur={() => handleRenameSubmit(file.id)}
                  autoFocus
                  className="bg-black/60 border border-neon-cyan/50 text-white text-sm px-1 outline-none w-full font-mono rounded"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span 
                  className="text-sm truncate font-mono"
                  onDoubleClick={(e) => startRename(file.id, file.name, e)}
                >
                  {file.name}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-2">
              {editingFileId !== file.id && (
                <button
                  onClick={(e) => startRename(file.id, file.name, e)}
                  className="p-0.5 hover:bg-white/10 rounded text-gray-500 hover:text-neon-cyan transition-colors"
                  title="Rename"
                >
                  <Edit2 size={12} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileClose(file.id);
                }}
                className="p-0.5 hover:bg-white/10 rounded text-gray-500 hover:text-neon-pink transition-colors"
                title="Close"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
        
        {files.length === 0 && (
          <div className="p-4 text-center text-gray-600 text-xs italic">
            No files open
          </div>
        )}
      </div>

      <div className="p-4 border-t border-cyber-border bg-black/20">
        <div className="text-[10px] text-gray-500 uppercase tracking-tighter mb-2">Project Info</div>
        <div className="text-[11px] text-gray-400 font-mono">
          <div className="flex justify-between">
            <span>Files:</span>
            <span className="text-neon-green">{files.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="text-neon-cyan">Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
