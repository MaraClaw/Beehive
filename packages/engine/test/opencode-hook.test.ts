import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import swarmvaultGraphFirst from "../src/hooks/opencode.js";

type BunRuntime = {
  file(input: string): { arrayBuffer(): Promise<ArrayBuffer> };
};

const tempDirs: string[] = [];
let hadBun = false;
let previousBun: BunRuntime | undefined;
let previousOut: string | undefined;
let previousWorkspaceId: string | undefined;

beforeEach(() => {
  hadBun = Reflect.has(globalThis, "Bun");
  previousBun = hadBun ? (Reflect.get(globalThis, "Bun") as BunRuntime) : undefined;
  previousOut = process.env.SWARMVAULT_OUT;
  previousWorkspaceId = process.env.SWARMVAULT_WORKSPACE_ID;
  Object.defineProperty(globalThis, "Bun", {
    configurable: true,
    writable: true,
    value: {
      file(input: string) {
        return {
          async arrayBuffer() {
            const buffer = await fs.readFile(input);
            return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
          }
        };
      }
    } satisfies BunRuntime
  });
});

afterEach(async () => {
  if (hadBun) {
    Object.defineProperty(globalThis, "Bun", {
      configurable: true,
      writable: true,
      value: previousBun
    });
  } else {
    Reflect.deleteProperty(globalThis, "Bun");
  }
  if (previousOut === undefined) {
    delete process.env.SWARMVAULT_OUT;
  } else {
    process.env.SWARMVAULT_OUT = previousOut;
  }
  if (previousWorkspaceId === undefined) {
    delete process.env.SWARMVAULT_WORKSPACE_ID;
  } else {
    process.env.SWARMVAULT_WORKSPACE_ID = previousWorkspaceId;
  }
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("OpenCode graph-first hook", () => {
  it("logs graph-first guidance when the default graph report exists", async () => {
    const rootDir = await createTempWorkspace();
    await writeReport(path.join(rootDir, "wiki", "graph", "report.md"));

    const messages = await collectSessionMessages(rootDir);

    expect(messages.join("\n")).toContain("SwarmVault graph-first");
  });

  it("resolves the graph report under SWARMVAULT_OUT and SWARMVAULT_WORKSPACE_ID", async () => {
    const rootDir = await createTempWorkspace();
    process.env.SWARMVAULT_OUT = ".swarmvault-out";
    process.env.SWARMVAULT_WORKSPACE_ID = "qa";
    await writeReport(path.join(rootDir, ".swarmvault-out", "qa", "wiki", "graph", "report.md"));

    const messages = await collectSessionMessages(rootDir);

    expect(messages.join("\n")).toContain("SwarmVault graph-first");
  });

  it("does not log graph-first guidance when the graph report is missing", async () => {
    const rootDir = await createTempWorkspace();

    const messages = await collectSessionMessages(rootDir);

    expect(messages).toEqual([]);
  });
});

async function createTempWorkspace(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "swarmvault-opencode-hook-"));
  tempDirs.push(dir);
  return dir;
}

async function writeReport(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, "# Graph Report\n", "utf8");
}

async function collectSessionMessages(cwd: string): Promise<string[]> {
  const messages: string[] = [];
  const plugin = await swarmvaultGraphFirst({
    client: {
      app: {
        log(entry) {
          messages.push(entry.message);
        }
      }
    }
  });
  await plugin["session.created"]({ session: { cwd } });
  return messages;
}
