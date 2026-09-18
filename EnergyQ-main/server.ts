import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createServer as createViteServer } from "vite";
import { spawn, execSync, ChildProcess } from "child_process";

const app = express();
const PORT = 3000;
const FASTAPI_PORT = 8001;

// CORS setup
app.use(cors());

// Spawn Python FastAPI server with Uvicorn in background
let fastapiProcess: ChildProcess | null = null;

function startFastAPIServer() {
  console.log(`[Backend Bridge] Starting Python FastAPI server on port ${FASTAPI_PORT}...`);
  
  // Ensure mariadb service is running and users/databases are set up
  try {
    execSync("service mariadb start && python3 -m backend.app.setup_db_user", { stdio: "inherit" });
  } catch (err) {
    console.warn("[Backend Bridge] MariaDB setup check warning:", err);
  }

  fastapiProcess = spawn(
    "python3",
    ["-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", String(FASTAPI_PORT)],
    {
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1",
      },
      stdio: "inherit",
    }
  );

  fastapiProcess.on("error", (err) => {
    console.error("[Backend Bridge] Failed to start Python FastAPI process:", err);
  });

  fastapiProcess.on("exit", (code, signal) => {
    console.warn(`[Backend Bridge] Python FastAPI process exited with code ${code} / signal ${signal}. Restarting in 2s...`);
    setTimeout(startFastAPIServer, 2000);
  });
}

// Start Python FastAPI backend
startFastAPIServer();

// Clean up on termination
process.on("SIGINT", () => {
  if (fastapiProcess) fastapiProcess.kill();
  process.exit();
});
process.on("SIGTERM", () => {
  if (fastapiProcess) fastapiProcess.kill();
  process.exit();
});

// Proxy all /api requests directly to the Python FastAPI backend
// When mounted at '/api', Express strips '/api', so we prepend '/api' to proxy target
app.use(
  "/api",
  createProxyMiddleware({
    target: `http://127.0.0.1:${FASTAPI_PORT}`,
    changeOrigin: true,
    ws: true,
    logLevel: "warn",
    pathRewrite: (pathStr) => `/api${pathStr}`,
    onError: (err, req, res) => {
      console.error("[Proxy Error] FastAPI not reachable:", err.message);
      if (!res.headersSent) {
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          status: "error",
          detail: "FastAPI backend is warming up, please retry in a moment.",
        }));
      }
    },
  })
);

// ============================================================
// Vite Middleware & Static Frontend Server (Port 3000)
// ============================================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("{*all}", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Household Energy Server listening on port ${PORT}`);
    console.log(`- Frontend: http://0.0.0.0:${PORT}`);
    console.log(`- Python FastAPI API Proxy: /api -> http://127.0.0.1:${FASTAPI_PORT}`);
  });
}

startServer();
