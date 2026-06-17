import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

type ImportGraph = Map<string, string[]>;

async function engineSourceFiles(): Promise<string[]> {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const srcDir = path.resolve(testDir, "../src");
  const files: string[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
        files.push(path.relative(srcDir, absolutePath));
      }
    }
  }

  await walk(srcDir);
  return files.sort((left, right) => left.localeCompare(right));
}

function dependencyForImport(importer: string, specifier: string, fileSet: Set<string>): string | null {
  const importerDir = path.dirname(importer);
  const baseTarget = path.normalize(path.join(importerDir, specifier));
  const candidates = [
    specifier.endsWith(".js") ? `${baseTarget.slice(0, -3)}.ts` : null,
    path.extname(baseTarget) ? null : `${baseTarget}.ts`,
    path.extname(baseTarget) ? null : path.join(baseTarget, "index.ts"),
    baseTarget
  ].filter((candidate): candidate is string => candidate !== null);

  for (const candidate of candidates) {
    if (fileSet.has(candidate)) {
      return candidate;
    }
  }
  return null;
}

async function buildEngineImportGraph(): Promise<ImportGraph> {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const srcDir = path.resolve(testDir, "../src");
  const files = await engineSourceFiles();
  const fileSet = new Set(files);
  const graph: ImportGraph = new Map(files.map((file) => [file, []]));
  const importPattern = /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?from\s+)?['"](\.\.?\/[^'"]+)['"]/g;

  for (const file of files) {
    const text = await fs.readFile(path.join(srcDir, file), "utf8");
    const dependencies = graph.get(file) ?? [];
    for (const match of text.matchAll(importPattern)) {
      const specifier = match[1];
      if (!specifier) {
        continue;
      }
      const dependency = dependencyForImport(file, specifier, fileSet);
      if (dependency) {
        dependencies.push(dependency);
      }
    }
  }

  return graph;
}

function requiredMapValue(values: Map<string, number>, key: string): number {
  const value = values.get(key);
  if (value === undefined) {
    throw new Error(`Missing Tarjan index for ${key}`);
  }
  return value;
}

function stronglyConnectedComponents(graph: ImportGraph): string[][] {
  let index = 0;
  const stack: string[] = [];
  const onStack = new Set<string>();
  const indexes = new Map<string, number>();
  const lowLinks = new Map<string, number>();
  const components: string[][] = [];

  function strongConnect(file: string): void {
    indexes.set(file, index);
    lowLinks.set(file, index);
    index += 1;
    stack.push(file);
    onStack.add(file);

    for (const dependency of graph.get(file) ?? []) {
      if (!indexes.has(dependency)) {
        strongConnect(dependency);
        lowLinks.set(file, Math.min(requiredMapValue(lowLinks, file), requiredMapValue(lowLinks, dependency)));
      } else if (onStack.has(dependency)) {
        lowLinks.set(file, Math.min(requiredMapValue(lowLinks, file), requiredMapValue(indexes, dependency)));
      }
    }

    if (requiredMapValue(lowLinks, file) !== requiredMapValue(indexes, file)) {
      return;
    }

    const component: string[] = [];
    while (stack.length) {
      const dependency = stack.pop();
      if (dependency === undefined) {
        throw new Error("Import cycle stack underflow.");
      }
      onStack.delete(dependency);
      component.push(dependency);
      if (dependency === file) {
        break;
      }
    }
    if (component.length > 1) {
      components.push(component.sort((left, right) => left.localeCompare(right)));
    }
  }

  for (const file of graph.keys()) {
    if (!indexes.has(file)) {
      strongConnect(file);
    }
  }

  return components.sort((left, right) => left.join("\n").localeCompare(right.join("\n")));
}

describe("engine architecture", () => {
  it("keeps engine source imports acyclic", async () => {
    const graph = await buildEngineImportGraph();

    const cycles = stronglyConnectedComponents(graph);

    expect(cycles).toEqual([]);
  });
});
