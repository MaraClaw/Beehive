import { defaultBenchmarkQuestionsForGraph, graphHash } from "./benchmark.js";
import type { BenchmarkArtifact, GraphArtifact, VaultConfig } from "./types.js";
import { normalizeWhitespace, readJsonFile } from "./utils.js";

export function configuredBenchmarkQuestionsForGraph(graph: GraphArtifact, config: VaultConfig): string[] {
  const configuredQuestions = (config.benchmark?.questions ?? []).map((question) => normalizeWhitespace(question)).filter(Boolean);
  const maxQuestions = Math.max(1, config.benchmark?.maxQuestions ?? 3);
  return (configuredQuestions.length ? configuredQuestions : defaultBenchmarkQuestionsForGraph(graph, maxQuestions)).slice(0, maxQuestions);
}

function sameQuestions(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((question, index) => question === right[index]);
}

export async function readReusableConfiguredBenchmarkArtifact(
  benchmarkPath: string,
  graph: GraphArtifact,
  config: VaultConfig
): Promise<BenchmarkArtifact | null> {
  const artifact = await readJsonFile<BenchmarkArtifact>(benchmarkPath);
  if (!artifact) {
    return null;
  }
  if (artifact.graphHash !== graphHash(graph)) {
    return null;
  }
  if (!sameQuestions(artifact.sampleQuestions, configuredBenchmarkQuestionsForGraph(graph, config))) {
    return null;
  }
  return artifact;
}
