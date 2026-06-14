# ENGINE PROVIDERS KNOWLEDGE BASE

## OVERVIEW

Provider adapters are capability-driven boundaries between SwarmVault tasks and model, embedding, image, audio, and custom provider implementations.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Adapter contract | `../types.ts` | `ProviderAdapter`, capabilities, task/provider config types. |
| Shared defaults | `base.ts` | Unsupported-method defaults, structured JSON fallback/validation. |
| Resolution | `registry.ts` | `getProviderForTask`, `createProvider`, `assertProviderCapability`. |
| OpenAI-compatible behavior | `openai-compatible.ts` | Structured output and schema quirks. |
| Local audio | `local-whisper.ts` | Audio-only adapter; rejects text/embedding/image tasks. |
| Custom providers | `custom.ts` | Module loader expects `createAdapter(id, config, rootDir)`. |

## CONVENTIONS

- Capability checks are the source of truth; callers should ask the registry for a task-capable provider.
- Provider config must use `apiKeyEnv`; literal `apiKey` is rejected to avoid secret persistence.
- Structured JSON support varies by provider; keep fallback parsing and schema validation explicit.
- Custom modules are workspace-facing extension points, so error messages need provider id, module path, and missing export details.
- Local/offline providers may be valid but lower quality; do not mark heuristic or local providers as invalid just because quality is lower.

## ANTI-PATTERNS

- Do not read cloud API keys directly from config files.
- Do not assume text generation, embeddings, image analysis, and audio transcription are all present on one adapter.
- Do not throw for missing optional provider features when the caller can continue with warnings.
- Do not import CLI or viewer code from provider adapters.

## TESTS

```bash
pnpm --filter @swarmvaultai/engine test -- provider
pnpm --filter @swarmvaultai/engine test -- openai-provider
pnpm --filter @swarmvaultai/engine test -- local-whisper
```

## NOTES

- Tests should use fake adapters, fake binaries, temp provider modules, and `fetch` stubs; never live cloud APIs.
- Add new providers with registry coverage, capability assertions, and clear unsupported-method behavior.
