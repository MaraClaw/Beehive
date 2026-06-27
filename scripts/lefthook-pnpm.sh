#!/bin/sh

set -eu

if [ -n "${HOME:-}" ]; then
  PATH="$HOME/.local/share/pnpm:$HOME/Library/pnpm:$HOME/.volta/bin:$HOME/.asdf/shims:$HOME/.local/share/mise/shims:$PATH"
fi

PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
export PATH

if command -v pnpm >/dev/null 2>&1; then
  exec pnpm "$@"
fi

if command -v corepack >/dev/null 2>&1; then
  exec corepack pnpm "$@"
fi

printf '%s\n' "pnpm was not found for lefthook. Install pnpm or set PATH so the git hook can find it." >&2
exit 127
