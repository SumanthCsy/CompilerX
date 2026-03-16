import React from 'react';
import Editor from '@monaco-editor/react';
import { FileNode } from '../types';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  file: FileNode | null;
  onChange: (content: string | undefined) => void;
  onAskAI?: (code: string) => void;
}

export default function CodeEditor({ file, onChange, onAskAI }: CodeEditorProps) {
  if (!file) {
    return (
      <div className="flex-1 bg-cyber-bg flex items-center justify-center text-gray-600 font-mono text-sm cyber-grid">
        <div className="text-center">
          <div className="mb-4 text-4xl opacity-20">{'< />'}</div>
          Select a file to start coding
        </div>
      </div>
    );
  }

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: any) => {
    editor.addAction({
      id: 'ask-compilerx-ai',
      label: '✨ Ask CompilerX AI',
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: function (ed) {
        if (!onAskAI) return;
        const selection = ed.getSelection();
        if (selection && !selection.isEmpty()) {
          const selectedText = ed.getModel()?.getValueInRange(selection);
          if (selectedText) {
            onAskAI(selectedText);
          }
        } else {
          onAskAI('');
        }
      }
    });
  };

  return (
    <div className="flex-1 h-full relative overflow-hidden">
      <Editor
        height="100%"
        theme="vs-dark"
        language={file.language}
        value={file.content}
        onChange={onChange}
        onMount={handleEditorMount}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 10,
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
        loading={
          <div className="h-full w-full flex items-center justify-center bg-cyber-bg text-neon-cyan animate-pulse font-mono">
            INITIALIZING CORE...
          </div>
        }
      />
      <div className="absolute bottom-4 right-8 px-3 py-1 bg-black/50 backdrop-blur-md border border-neon-cyan/30 rounded text-[10px] text-neon-cyan font-mono uppercase tracking-widest pointer-events-none z-10">
        {file.language} | UTF-8
      </div>
    </div>
  );
}
