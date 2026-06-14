import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

const readmes = [
  path.join(repoRoot, "README.md"),
  path.join(repoRoot, "README.zh-CN.md"),
  path.join(repoRoot, "README.ja.md")
];

const sectionMarkers = [
  "install",
  "quickstart",
  "provider-setup",
  "agent-setup",
  "input-types",
  "what-you-get",
  "platform-support",
  "worked-examples",
  "providers",
  "packages",
  "help",
  "development",
  "links",
  "license"
];

const requiredSubstrings = [
  "[English](README.md)",
  "[简体中文](README.zh-CN.md)",
  "[日本語](README.ja.md)",
  "npm install -g @beehive/cli",
  "beehive --version",
  "npm install -g @beehive/cli@latest",
  "beehive quickstart ./your-repo",
  "beehive quickstart ./path --no-serve",
  "beehive init --obsidian",
  "beehive source add https://github.com/karpathy/micrograd",
  "beehive source add https://example.com/docs/getting-started",
  "beehive source session transcript-or-session-id",
  "beehive source list",
  "beehive source session file-customer-call-srt-12345678",
  "beehive source reload --all",
  "beehive ingest ./src --repo-root .",
  "beehive add https://arxiv.org/abs/2401.12345",
  "beehive compile",
  "beehive query \"What is the auth flow?\"",
  "beehive chat \"How should the next agent use this vault?\"",
  "beehive export ai --out ./exports/ai",
  "beehive graph serve",
  "beehive check-update ./src",
  "beehive update ./src",
  "beehive cluster-only",
  "beehive tree --output ./exports/tree.html",
  "beehive graph export --neo4j ./exports/graph.cypher",
  "beehive merge-graphs ./exports/graph.json ./other-graph.json --out ./exports/merged-graph.json",
  "beehive clone https://github.com/owner/repo --no-viz",
  "beehive graph push neo4j --dry-run",
  "beehive install --agent claude --hook",
  "beehive install --agent codex --hook",
  "beehive install --agent copilot --hook",
  "beehive install --agent gemini --hook",
  "beehive install --agent kiro",
  "beehive install --agent hermes",
  "beehive install --agent antigravity",
  "beehive install --agent vscode",
  "beehive init --lite",
  "beehive mcp",
  "clawhub install beehive",
  "LLM Wiki",
  "https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f",
  ".epub",
  ".csv .tsv",
  ".xlsx",
  ".pptx",
  ".ipynb",
  ".odt .odp .ods",
  "\"type\": \"openai\"",
  "OPENAI_API_KEY",
  "https://www.beehive.ai/images/screenshots/graph-workspace.png",
  "https://www.beehive.ai/docs",
  "https://www.beehive.ai/docs/providers",
  "https://www.beehive.ai/docs/getting-started/troubleshooting",
  "https://www.npmjs.com/package/@beehive/cli",
  "https://github.com/beehive/beehive",
  "wiki/outputs/source-sessions/",
  "worked/book-reading/",
  "worked/research-deep-dive/",
  "worked/personal-knowledge-base/",
  "templates/llm-wiki-schema.md",
  "Memex"
];

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const readmePath of readmes) {
  const content = await fs.readFile(readmePath, "utf8");
  const relativePath = path.relative(repoRoot, readmePath);

  assertCondition(
    content.includes("<!-- readme-language-nav:start -->") && content.includes("<!-- readme-language-nav:end -->"),
    `${relativePath} is missing the language navigation markers`
  );

  let lastIndex = -1;
  for (const marker of sectionMarkers) {
    const token = `<!-- readme-section:${marker} -->`;
    const markerIndex = content.indexOf(token);
    assertCondition(markerIndex >= 0, `${relativePath} is missing section marker ${token}`);
    assertCondition(markerIndex > lastIndex, `${relativePath} has section marker ${token} out of order`);
    lastIndex = markerIndex;
  }

  for (const required of requiredSubstrings) {
    assertCondition(content.includes(required), `${relativePath} is missing required content: ${required}`);
  }
}

console.log(`README parity check passed for ${readmes.length} files.`);
