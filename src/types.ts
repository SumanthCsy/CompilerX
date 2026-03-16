export interface FileNode {
  id: string;
  name: string;
  content: string;
  language: string;
  isOpen?: boolean;
}

export interface Runtime {
  language: string;
  version: string;
  aliases: string[];
}

export interface ExecutionResult {
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}
