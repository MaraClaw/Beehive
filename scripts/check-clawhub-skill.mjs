import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const skillDir = path.join(repoRoot, "skills", "beehive");

const requiredFiles = [
  "SKILL.md",
  "README.md",
  "TROUBLESHOOTING.md",
  "examples/quickstart.md",
  "examples/repo-workflow.md",
  "examples/research-workflow.md",
  "references/commands.md",
  "references/artifacts.md",
  "validation/smoke-prompts.md"
];

const requiredReadmeSubstrings = [
  "clawhub install beehive",
  "npm install -g @beehive/cli",
  "beehive --version",
  "clawhub update beehive",
  "npm install -g @beehive/cli@latest",
  "beehive quickstart",
  "beehive init",
  "beehive ingest",
  ".epub",
  ".csv",
  ".xlsx",
  ".pptx",
  "beehive add",
  "beehive compile",
  "beehive query",
  "beehive chat",
  "beehive export ai",
  "beehive graph serve",
  "beehive mcp",
  "https://www.beehive.ai/docs",
  "https://www.beehive.ai/docs/providers",
  "https://www.beehive.ai/docs/getting-started/troubleshooting",
  "https://www.npmjs.com/package/@beehive/cli",
  "https://github.com/beehive/beehive"
];

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function extractMatch(content, regex, label) {
  const match = content.match(regex);
  assertCondition(match?.[1], `Could not read ${label} from SKILL.md`);
  return match[1];
}

const rootPackageJson = JSON.parse(await fs.readFile(path.join(repoRoot, "package.json"), "utf8"));
const cliPackageJson = JSON.parse(await fs.readFile(path.join(repoRoot, "packages/cli/package.json"), "utf8"));
const enginePackageJson = JSON.parse(await fs.readFile(path.join(repoRoot, "packages/engine/package.json"), "utf8"));
const viewerPackageJson = JSON.parse(await fs.readFile(path.join(repoRoot, "packages/viewer/package.json"), "utf8"));

for (const relativePath of requiredFiles) {
  const absolutePath = path.join(skillDir, relativePath);
  const content = await fs.readFile(absolutePath, "utf8");
  assertCondition(content.trim().length > 0, `Skill file ${relativePath} is empty`);
}

const skillContent = await fs.readFile(path.join(skillDir, "SKILL.md"), "utf8");
const readmeContent = await fs.readFile(path.join(skillDir, "README.md"), "utf8");
const skillVersion = extractMatch(skillContent, /^version:\s*"([^"]+)"$/m, "version");
const metadataJson = extractMatch(skillContent, /^metadata:\s*'(.+)'$/m, "metadata");
const metadata = JSON.parse(metadataJson);

assertCondition(skillVersion === rootPackageJson.version, `Skill version ${skillVersion} does not match root package version ${rootPackageJson.version}`);
assertCondition(cliPackageJson.version === rootPackageJson.version, "CLI package version is out of sync with root package version");
assertCondition(enginePackageJson.version === rootPackageJson.version, "Engine package version is out of sync with root package version");
assertCondition(viewerPackageJson.version === rootPackageJson.version, "Viewer package version is out of sync with root package version");

const openclaw = metadata.openclaw ?? {};
const installEntries = Array.isArray(openclaw.install) ? openclaw.install : [];
const primaryInstall = installEntries.find((entry) => entry?.package === "@beehive/cli");

assertCondition(Array.isArray(openclaw.requires?.anyBins), "Skill metadata is missing openclaw.requires.anyBins");
assertCondition(openclaw.requires.anyBins.includes("beehive"), "Skill metadata is missing the beehive bin requirement");
assertCondition(openclaw.requires.anyBins.includes("vault"), "Skill metadata is missing the vault bin requirement");
assertCondition(primaryInstall, "Skill metadata is missing the @beehive/cli install entry");
assertCondition(Array.isArray(primaryInstall.bins) && primaryInstall.bins.includes("beehive"), "Skill install entry must expose the beehive bin");
assertCondition(typeof openclaw.homepage === "string" && openclaw.homepage.includes("beehive.ai"), "Skill metadata homepage is missing or invalid");

for (const required of requiredReadmeSubstrings) {
  assertCondition(readmeContent.includes(required), `Skill README is missing required content: ${required}`);
}

console.log(`ClawHub skill check passed for ${requiredFiles.length} files.`);
