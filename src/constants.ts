import { Runtime } from './types';

export const SUPPORTED_LANGUAGES: Record<string, string> = {
  'javascript': 'js',
  'typescript': 'ts',
  'python': 'py',
  'java': 'java',
  'c': 'c',
  'cpp': 'cpp',
  'csharp': 'cs',
  'go': 'go',
  'rust': 'rs',
  'php': 'php',
  'ruby': 'rb',
  'kotlin': 'kt',
  'swift': 'swift',
  'r': 'r',
  'perl': 'pl',
  'bash': 'sh',
};

export const DEFAULT_FILES = [
  {
    id: '1',
    name: 'main.js',
    content: 'console.log("Hello, CompilerX!");\n\n// Try writing some code here...',
    language: 'javascript',
  },
  {
    id: '2',
    name: 'hello.py',
    content: 'print("Hello from Python!")\n\n# Cyberpunk coding begins...',
    language: 'python',
  }
];

export const LANGUAGE_VERSIONS: Record<string, string> = {
  'javascript': '*',
  'typescript': '*',
  'python': '*',
  'java': '*',
  'c': '*',
  'cpp': '*',
  'go': '*',
  'rust': '*',
};
