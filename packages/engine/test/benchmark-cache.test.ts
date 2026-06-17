import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { compileVault, defaultVaultConfig, ingestInput, initVault } from "../src/index.js";
import type { BenchmarkArtifact, VaultConfig } from "../src/types.js";

const tempDirs: string[] = [];
const BENCHMARK_SENTINEL_GENERATED_AT = "2000-01-01T00:00:00.000Z";

async function createTempWorkspace(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "beehive-benchmark-cache-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

async function writeBenchmarkConfig(rootDir: string, benchmark: NonNullable<VaultConfig["benchmark"]>): Promise<void> {
  await fs.writeFile(
    path.join(rootDir, "beehive.config.json"),
    `${JSON.stringify(
      {
        ...defaultVaultConfig(),
        benchmark
      } satisfies VaultConfig,
      null,
      2
    )}\n`,
    "utf8"
  );
}

async function readBenchmark(rootDir: string): Promise<BenchmarkArtifact> {
  return JSON.parse(await fs.readFile(path.join(rootDir, "state", "benchmark.json"), "utf8")) as BenchmarkArtifact;
}

async function writeBenchmark(rootDir: string, artifact: BenchmarkArtifact): Promise<void> {
  await fs.writeFile(path.join(rootDir, "state", "benchmark.json"), `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
}

async function createCompiledVault(rootDir: string, questions: string[], maxQuestions: number): Promise<void> {
  await initVault(rootDir);
  await writeBenchmarkConfig(rootDir, { questions, maxQuestions });
  await fs.writeFile(
    path.join(rootDir, "alpha.md"),
    "# Alpha\n\nDurable memory links context packs, graph paths, benchmark questions, and clean compile reuse.\n",
    "utf8"
  );
  await ingestInput(rootDir, path.join(rootDir, "alpha.md"));
  await compileVault(rootDir);
  await compileVault(rootDir);
}

describe("configured benchmark cache", () => {
  it("reuses the configured benchmark artifact on unchanged clean compile", async () => {
    const rootDir = await createTempWorkspace();
    const questions = ["How does Alpha connect benchmark reuse?", "Which context should an agent read first?"];
    await createCompiledVault(rootDir, questions, 2);
    const first = await readBenchmark(rootDir);
    await writeBenchmark(rootDir, {
      ...first,
      generatedAt: BENCHMARK_SENTINEL_GENERATED_AT
    });

    await compileVault(rootDir);

    const second = await readBenchmark(rootDir);
    expect(second.generatedAt).toBe(BENCHMARK_SENTINEL_GENERATED_AT);
    expect(second.sampleQuestions).toEqual(questions);
  });

  it("invalidates benchmark reuse when configured questions change", async () => {
    const rootDir = await createTempWorkspace();
    const originalQuestions = ["How does Alpha connect benchmark reuse?"];
    const nextQuestions = ["What changed in the configured benchmark question set?", "Which page proves invalidation?"];
    await createCompiledVault(rootDir, originalQuestions, 1);
    const first = await readBenchmark(rootDir);
    await writeBenchmark(rootDir, {
      ...first,
      generatedAt: BENCHMARK_SENTINEL_GENERATED_AT
    });
    await writeBenchmarkConfig(rootDir, { questions: nextQuestions, maxQuestions: 2 });

    await compileVault(rootDir);

    const second = await readBenchmark(rootDir);
    expect(second.generatedAt).not.toBe(BENCHMARK_SENTINEL_GENERATED_AT);
    expect(second.sampleQuestions).toEqual(nextQuestions);
  });
});
