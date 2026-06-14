# SWARMVAULT SKILL KNOWLEDGE BASE

## OVERVIEW

This directory is the published ClawHub/OpenClaw skill package for Beehive. It is a text-only artifact with its own frontmatter, required files, examples, validation prompts, and publish/inspect lifecycle.

## STRUCTURE

```
SKILL.md                    # skill frontmatter and main instructions
README.md                   # packaged ClawHub README and install/update contract
TROUBLESHOOTING.md          # runtime and release gotchas
examples/                   # quickstart, repo, research, graph-first workflows
references/commands.md      # command cheat sheet
references/artifacts.md     # generated artifact taxonomy
validation/smoke-prompts.md # human validation prompts
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Required bundle check | `../../scripts/check-clawhub-skill.mjs` | Required files, frontmatter metadata, README substrings. |
| Publish | `../../scripts/publish-clawhub-skill.mjs` | Slug/name/version/tags/changelog and dry-run behavior. |
| Release gate | `../../scripts/release-preflight.mjs`, `../../scripts/release-publish.mjs` | Skill dry-run, publish, inspect. |
| CLI docs parity | `../../packages/cli/README.md`, `../../README.md` | Agent install and generated artifact wording. |
| Agent install implementation | `../../packages/engine/src/agents.ts` | AGENTS.md targets, skill bundle paths, hooks, hygiene edits. |

## CONVENTIONS

- `SKILL.md` frontmatter must keep `name: swarmvault`, current version, description, and `metadata` as a quoted JSON string.
- `metadata.openclaw.requires.anyBins` includes `swarmvault` and `vault`.
- `metadata.openclaw.install` includes package `@swarmvaultai/cli` and exposes `swarmvault` plus `vault` bins.
- Skill version must match root/package versions enforced by release sync.
- README required substrings include ClawHub install/update commands, npm install/update commands, `swarmvault --version`, core CLI commands, supported file extensions, docs links, npm, and GitHub.
- `examples/graph-first-agent-workflow.md` is authored package content even if not currently required by the checker.

## ANTI-PATTERNS

- Do not paraphrase checker-required README substrings so much that substring checks fail.
- Do not claim the skill bundles the CLI; users still need Node >=24 and `npm install -g @swarmvaultai/cli` or ClawHub install flow.
- Do not say `init`, `quickstart`, `scan`, or `clone` install project-local agent rules by default.
- Do not imply web search affects compile/query/explore generally; README scopes web search to deep lint.
- Do not say heuristic or local providers are invalid; they are valid lower-quality/offline starts.

## COMMANDS

```bash
pnpm check:clawhub-skill
pnpm skill:publish -- --dry-run
pnpm skill:inspect
pnpm live:cli-surface
```

## GENERATED ARTIFACT NOTES

- Generated vault roots normally include `raw/`, `wiki/`, `state/`, `agent/`, and `inbox/`; `SWARMVAULT_OUT` can move those while config/schema remain at project root.
- Raw sources are immutable provenance; corrections belong in schema, new sources, or saved outputs.
- Save-first commands include `query`, `chat`, `context build`, `export ai`, and `task`.
- `compile --approve` stages review bundles in `state/approvals/`; candidates stage under `wiki/candidates/`.

## NOTES

- If adding/removing CLI commands, update `scripts/cli-surface-smoke.mjs`, examples, README, and smoke prompts together.
- Shared agent rule files preserve user content around Beehive managed blocks.
