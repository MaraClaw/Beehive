# ENGINE TEST KNOWLEDGE BASE

## OVERVIEW

Engine tests are integration-heavy Vitest files that generate temp vaults, fake providers, local HTTP fixtures, code repos, media inputs, and graph/wiki artifacts.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Broad vault workflows | `vault.test.ts` | Large catchall for compile, graph, artifacts, private URL, temp HOME/OUT. |
| Code ingestion | `code-ingestion.test.ts` | Symbol extraction, module graph, language cases. |
| Source kinds | `tiny-validation.test.ts` | Generated Office/data/book/Jupyter/ODF/BibTeX/RTF/org/AsciiDoc/image variants. |
| Managed sources | `managed-sources.test.ts` | Local HTTP/private URL fixture behavior. |
| Providers | `provider-registry.test.ts`, `openai-provider.test.ts`, `web-search-gap-fill.test.ts` | Fakes and stubs only. |
| Media | `local-whisper*.test.ts`, `audio-*.test.ts`, `youtube-extraction.test.ts` | Optional binaries/providers isolated. |
| Hooks | `claude-hook.test.ts` | Hook marker/graph-first behavior. |

## CONVENTIONS

- Temp workspaces are file-local: `fs.mkdtemp(path.join(os.tmpdir(), "beehive-<feature>-"))`, tracked, and removed in `afterEach`.
- Config helpers write `beehive.config.json` with `JSON.stringify(config, null, 2) + "\n"`.
- Fixtures are inline or generated in test files; there is no shared fixture directory here.
- Use fake executable scripts with `chmod(0o755)`, temp provider `.mjs` modules, synthetic WAV buffers, and local servers.
- Restore or isolate env vars: private URL allowance, binary overrides, `BEEHIVE_OUT`, graph flags, cloud keys, `HOME`, `PATH`.
- Use `vi.restoreAllMocks()` after spies/stubs/mocks.

## ANTI-PATTERNS

- Do not call live cloud APIs, real YouTube, live Neo4j, or mandatory local whisper/ffmpeg/yt-dlp.
- Do not assert developer-machine absolute paths or global state unless controlled by the test.
- Do not add unrelated cases to `vault.test.ts` when a focused sibling test can cover the workflow.
- Do not delete duplicated-looking helpers without checking why that test isolates temp paths/env differently.

## COMMANDS

```bash
pnpm --filter @beehive/engine test
BEEHIVE_ALLOW_PRIVATE_URLS=1 pnpm --filter @beehive/engine test
```

## NOTES

- Local HTTP fixtures are allowed when paired with private URL opt-in.
- Provider routing is usually mocked through `registry.getProviderForTask`.
- Fixture-only `.env` text in tiny validation is document content, not process env.
