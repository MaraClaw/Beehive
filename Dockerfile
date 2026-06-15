# Beehive MCP server
#
# Builds the Beehive CLI from the workspace and exposes the MCP server over
# stdio (the same transport that Claude Code, Codex, OpenCode, and other MCP
# clients use). Used by the Glama MCP registry to verify that the server starts
# and responds to MCP introspection.
#
# Run locally:
#   docker build -t beehive-mcp .
#   docker run --rm -i beehive-mcp

FROM node:26-alpine AS build

WORKDIR /app

# Install pnpm matching the workspace's packageManager field
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# Copy workspace manifests first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/cli/package.json ./packages/cli/
COPY packages/engine/package.json ./packages/engine/
COPY packages/viewer/package.json ./packages/viewer/

RUN pnpm install --frozen-lockfile

# Copy the rest of the workspace and build the CLI (and its deps)
COPY . .
RUN pnpm --filter @beehive/viewer build \
 && pnpm --filter @beehive/engine build \
 && pnpm --filter @beehive/cli build \
 && pnpm prune --prod

FROM node:26-alpine

WORKDIR /app

# Bring in the built workspace plus pruned production dependencies
COPY --from=build /app /app

ENV NODE_ENV=production

# `beehive mcp` starts the MCP server over stdio. Glama's introspection
# checks send MCP requests over stdio and expect responses, which this entry
# point satisfies.
ENTRYPOINT ["node", "/app/packages/cli/dist/index.js", "mcp"]
