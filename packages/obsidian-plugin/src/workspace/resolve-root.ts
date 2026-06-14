import { existsSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, parse, resolve } from "node:path";
import { WORKSPACE_CONFIG_MARKER, WORKSPACE_MARKER, WORKSPACE_WALKUP_LIMIT } from "../constants";

export interface ResolveRootOptions {
  override?: string;
  maxDepth?: number;
  exists?: (path: string) => boolean;
  isDirectory?: (path: string) => boolean;
}

export interface WorkspaceRootResolution {
  root: string | null;
  source: "override" | "marker" | "not-found";
}

function findWorkspaceRoot(
  start: string,
  maxDepth: number,
  exists: (path: string) => boolean,
  isDirectory: (path: string) => boolean
): string | null {
  let current = isDirectory(start) ? start : dirname(start);
  const rootOfDrive = parse(current).root;
  let schemaMarkerRoot: string | null = null;

  for (let depth = 0; depth <= maxDepth; depth++) {
    if (exists(join(current, WORKSPACE_CONFIG_MARKER))) {
      return current;
    }
    if (!schemaMarkerRoot && exists(join(current, WORKSPACE_MARKER))) {
      schemaMarkerRoot = current;
    }
    if (current === rootOfDrive) break;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return schemaMarkerRoot;
}

export function resolveWorkspaceRoot(start: string | null | undefined, options: ResolveRootOptions = {}): WorkspaceRootResolution {
  const exists = options.exists ?? ((p) => existsSync(p));
  const isDirectory =
    options.isDirectory ??
    ((p) => {
      try {
        return statSync(p).isDirectory();
      } catch {
        return false;
      }
    });

  if (options.override && options.override.length > 0) {
    const abs = isAbsolute(options.override) ? options.override : resolve(options.override);
    const root = findWorkspaceRoot(abs, options.maxDepth ?? WORKSPACE_WALKUP_LIMIT, exists, () => true);
    if (root) {
      return { root, source: "override" };
    }
    return { root: null, source: "not-found" };
  }

  if (!start) return { root: null, source: "not-found" };
  const startAbs = isAbsolute(start) ? start : resolve(start);
  const maxDepth = options.maxDepth ?? WORKSPACE_WALKUP_LIMIT;
  const root = findWorkspaceRoot(startAbs, maxDepth, exists, isDirectory);
  if (root) {
    return { root, source: "marker" };
  }

  return { root: null, source: "not-found" };
}
