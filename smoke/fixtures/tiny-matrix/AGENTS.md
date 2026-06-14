# TINY MATRIX FIXTURE KNOWLEDGE BASE

## OVERVIEW

This is a deterministic repo-shaped fixture matrix for code-language coverage and local ingest source-kind checks.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Matrix contract | `README.md` | Explains tiny language and local source fixture intent. |
| Local docs fixtures | `docs/` | Markdown, text, HTML, image, PDF/RST-style coverage. |
| Language leaves | `js`, `jsx`, `ts`, `tsx`, `bash`, `python`, `go`, `rust`, `java`, `kotlin`, `scala`, `dart`, `lua`, `zig`, `csharp`, `c`, `cpp`, `php`, `ruby`, `powershell` | Keep minimal cross-language shapes. |
| Engine expectations | `../../../packages/engine/test/tiny-validation.test.ts`, `../../../scripts/live-smoke.mjs` | Update assertions/generation when coverage changes. |

## CONVENTIONS

- Each language fixture is intentionally tiny, usually one widget plus helper/base/interface/import/export shape.
- Keep files small enough for fast live smoke while still exercising symbol/module extraction.
- Preserve nested shapes such as `go/helpers`, `python/pkg`, `dart/lib`, `rust/src`, `java/com/example`, `php/src`, and `ruby/lib`.
- `docs/page.html` is a code-language fixture during repo ingest, not prose HTML.
- `docs/guide.rst` covers text/RST routing and heading/directive normalization.
- Add committed language coverage only with matching expected-language updates in tests/smoke when applicable.

## ANTI-PATTERNS

- Do not collapse per-language directories into one flat sample.
- Do not remove helper/base files as dead weight; they encode graph edges.
- Do not add real app complexity, package installs, or generated build output.
- Do not replace tiny matrix files with large copied repositories.

## NOTES

- One `AGENTS.md` at this matrix root covers all language leaves; do not add per-language child instruction files.
- Generated document fixtures are maintained outside this directory in tests/scripts.
