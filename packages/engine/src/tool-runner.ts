import { spawn } from "node:child_process";

export type ToolRunResult = {
  code: number | null;
  stdout: string;
  stderr: string;
};

export function runTool(binary: string, args: string[], options?: { cwd?: string }): Promise<ToolRunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, {
      cwd: options?.cwd,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

export function toolFailure(binary: string, result: ToolRunResult): Error {
  const tail = (result.stderr || result.stdout).split(/\r?\n/).filter(Boolean).slice(-5).join("\n");
  return new Error(`${binary} exited with code ${result.code}${tail ? `: ${tail}` : ""}`);
}
