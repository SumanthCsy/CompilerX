import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import { Server as SocketIOServer } from "socket.io";
import { createServer as createHttpServer } from "http";
import * as pty from "node-pty";
import fs from "fs";
import os from "os";

const sharedSnippets = new Map<string, any[]>();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  const httpServer = createHttpServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*" }
  });

  app.use(express.json());

  // Real-time Interactive Terminal Execution (pty)
  io.on("connection", (socket) => {
    let ptyProcess: pty.IPty | null = null;
    let tempDir: string | null = null;
    let tempFile: string | null = null;

    socket.on("run", async (data) => {
      const { language, files } = data;
      const mainFile = files[0];

      try {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "compilerx-"));
        tempFile = path.join(tempDir, mainFile.name);
        fs.writeFileSync(tempFile, mainFile.content);

        let cmd = os.platform() === "win32" ? "python.exe" : "python3";
        let args: string[] = [];

        if (language === "python" || language === "py") {
          cmd = os.platform() === "win32" ? "python.exe" : "python3";
          args = ["-u", tempFile];
        } else if (language === "javascript" || language === "js" || language === "typescript" || language === "ts") {
          cmd = os.platform() === "win32" ? "node.exe" : "node";
          args = [tempFile];
        } else if (language === "c" || language === "cpp") {
          cmd = os.platform() === "win32" ? "cmd.exe" : "sh";
          if (os.platform() === "win32") {
            args = ["/c", `gcc "${tempFile}" -o "${tempDir}\\a.exe" && "${tempDir}\\a.exe"`];
          } else {
            args = ["-c", `gcc "${tempFile}" -o "${tempDir}/a.out" && "${tempDir}/a.out"`];
          }
        } else {
          cmd = os.platform() === "win32" ? "python.exe" : "python3";
          args = ["-c", `print('Language ${language} requires remote compilation API. Please use the stateless executor or stick to Python/JS for local interactive execution.')`];
        }

        ptyProcess = pty.spawn(cmd, args, {
          name: "xterm-256color",
          cols: 80,
          rows: 24,
          cwd: tempDir,
          env: process.env as any
        });

        ptyProcess.onData((data) => {
          socket.emit("data", data);
        });

        ptyProcess.onExit(({ exitCode, signal }) => {
          socket.emit("exit", { exitCode, signal });
        });
      } catch (err: any) {
        socket.emit("data", `Error starting sandbox: ${err.message}\r\n`);
        socket.emit("exit", { exitCode: 1 });
      }
    });

    socket.on("data", (data) => {
      if (ptyProcess) {
        ptyProcess.write(data);
      }
    });

    socket.on("kill", () => {
      if (ptyProcess) {
        ptyProcess.kill();
      }
    });

    socket.on("disconnect", () => {
      if (ptyProcess) ptyProcess.kill();
      if (tempDir) {
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) { }
      }
    });
  });

  // Proxy for code execution with CodeX as primary and Piston as fallback
  app.post("/api/compile", async (req, res) => {
    const { language, version, files, stdin } = req.body;
    const mainFile = files[0];

    // Language mapping for CodeX
    const codexMap: Record<string, string> = {
      'python': 'py',
      'javascript': 'js',
      'cpp': 'cpp',
      'c': 'c',
      'java': 'java',
      'go': 'go',
      'csharp': 'cs',
      'ruby': 'rb',
      'kotlin': 'kt',
      'php': 'php',
      'rust': 'rs',
      'typescript': 'ts'
    };

    const codexLang = codexMap[language];

    // 1. Try CodeX API First (Reliable Alternative)
    if (codexLang) {
      try {
        console.log(`Attempting CodeX execution for ${language}...`);
        const codexResponse = await axios.post("https://api.codex.jaagrav.in", {
          code: mainFile.content,
          language: codexLang,
          input: stdin || ""
        }, { timeout: 12000 });

        const data = codexResponse.data;
        if (data && (data.output || data.error || data.timeStamp)) {
          return res.json({
            language,
            version: "latest",
            run: {
              stdout: data.output || "",
              stderr: data.error || "",
              code: data.error ? 1 : 0,
              signal: null,
              output: data.output || data.error || ""
            }
          });
        }
      } catch (error: any) {
        console.warn("CodeX API failed, falling back to Judge0...", error.message);
      }
    }

    // 2. Fallback to Judge0 (Public CE Instance)
    const judge0Map: Record<string, number> = {
      'python': 71,
      'javascript': 63,
      'cpp': 54,
      'c': 50,
      'java': 62,
      'go': 60,
      'csharp': 51,
      'ruby': 72,
      'rust': 73,
      'php': 68,
      'typescript': 74
    };

    const judge0Id = judge0Map[language];
    if (judge0Id) {
      try {
        console.log(`Attempting Judge0 execution for ${language}...`);
        const rapidApiKey = process.env.RAPIDAPI_KEY;
        const rapidApiHost = process.env.RAPIDAPI_HOST;
        const judge0Url = rapidApiKey
          ? `https://${rapidApiHost}/submissions?base64_encoded=false&wait=true`
          : "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

        const judgeResponse = await axios.post(judge0Url, {
          source_code: mainFile.content,
          language_id: judge0Id,
          stdin: stdin || ""
        }, {
          headers: rapidApiKey ? {
            'x-rapidapi-key': rapidApiKey,
            'x-rapidapi-host': rapidApiHost,
            'Content-Type': 'application/json',
          } : {},
          timeout: 15000
        });

        const data = judgeResponse.data;
        if (data && (data.stdout || data.stderr || data.compile_output || data.status)) {
          return res.json({
            language,
            version: "latest",
            run: {
              stdout: data.stdout || "",
              stderr: data.stderr || data.compile_output || "",
              code: data.status?.id === 3 ? 0 : 1,
              signal: null,
              output: data.stdout || data.stderr || data.compile_output || data.status?.description || ""
            }
          });
        }
      } catch (error: any) {
        console.warn("Judge0 API failed, falling back to Piston mirrors...", error.message);
      }
    }

    // 3. Fallback to Piston Mirrors (If CodeX and Judge0 fail)
    const PISTON_MIRRORS = [
      process.env.PISTON_API_URL,
      "https://piston.deno.dev/api/v2/piston",
      "https://emkc.org/api/v2/piston"
    ].filter(Boolean) as string[];

    for (const baseUrl of PISTON_MIRRORS) {
      try {
        const EXECUTE_URL = `${baseUrl}/execute`;
        const RUNTIMES_URL = `${baseUrl}/runtimes`;
        let resolvedVersion = version;

        if (!resolvedVersion || resolvedVersion === "*") {
          try {
            const runtimesResponse = await axios.get(RUNTIMES_URL, { timeout: 2000 });
            const runtime = runtimesResponse.data.find((r: any) => r.language === language || r.aliases.includes(language));
            if (runtime) resolvedVersion = runtime.version;
          } catch (e) { }
        }

        const response = await axios.post(EXECUTE_URL, {
          language,
          version: resolvedVersion || "*",
          files,
          stdin,
        }, { timeout: 8000 });

        return res.json(response.data);
      } catch (error: any) {
        console.warn(`Piston mirror ${baseUrl} failed...`);
      }
    }

    // 4. Final Error
    res.status(503).json({
      message: "All code execution services (CodeX, Judge0, Piston) are currently unavailable. Please check your internet or host a private instance.",
      error: "Service Unavailable"
    });
  });

  // Get available Piston runtimes with fallback
  app.get("/api/runtimes", async (req, res) => {
    const PISTON_MIRRORS = [
      process.env.PISTON_API_URL,
      "https://piston.deno.dev/api/v2/piston",
      "https://emkc.org/api/v2/piston"
    ].filter(Boolean) as string[];

    for (const baseUrl of PISTON_MIRRORS) {
      try {
        const response = await axios.get(`${baseUrl}/runtimes`, { timeout: 3000 });
        return res.json(response.data);
      } catch (error: any) {
        console.error(`Runtimes fetch failed for ${baseUrl}`);
        continue;
      }
    }
    res.status(500).json({ error: "Failed to fetch runtimes from all mirrors" });
  });

  // Share Code API
  app.post("/api/share", (req, res) => {
    try {
      const { files } = req.body;
      const id = Math.random().toString(36).substr(2, 9);
      sharedSnippets.set(id, files);
      res.json({ id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/share/:id", (req, res) => {
    const files = sharedSnippets.get(req.params.id);
    if (!files) {
      return res.status(404).json({ error: "Snippet not found" });
    }
    res.json({ files });
  });

  // CORS Proxy for AI Requests
  app.post("/api/proxy", async (req, res) => {
    try {
      const { url, method, headers, body } = req.body;
      const response = await axios({
        url,
        method: method || "POST",
        headers: {
          ...headers,
          "Origin": undefined,
          "Referer": undefined
        },
        data: body,
        validateStatus: () => true // Allow all statuses through
      });
      res.status(response.status).json(response.data);
    } catch (err: any) {
      console.error("Proxy error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
