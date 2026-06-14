import { isAbsolute, join, resolve } from "node:path";
import { SWARMVAULT_OUT_ENV, SWARMVAULT_WORKSPACE_ID_ENV } from "../constants";
import type { BeehiveSettings } from "../settings/defaults";

const DEFAULT_PLUGIN_WORKSPACE_ID = "default";
const WORKSPACE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

export function resolvePluginWorkspaceId(settings: Pick<BeehiveSettings, "workspaceId">): string {
  const configured = settings.workspaceId.trim();
  if (!configured) {
    return DEFAULT_PLUGIN_WORKSPACE_ID;
  }
  if (!WORKSPACE_ID_PATTERN.test(configured)) {
    throw new Error(
      `Invalid Beehive workspace ID "${configured}". Use letters, numbers, underscores, and hyphens, starting with a letter or number.`
    );
  }
  return configured;
}

export function workspaceCliEnv(settings: Pick<BeehiveSettings, "workspaceId">): NodeJS.ProcessEnv {
  return {
    ...process.env,
    [SWARMVAULT_WORKSPACE_ID_ENV]: resolvePluginWorkspaceId(settings)
  };
}

export function workspaceArtifactRoot(workspaceRoot: string, settings: Pick<BeehiveSettings, "workspaceId">): string {
  const override = process.env[SWARMVAULT_OUT_ENV]?.trim();
  const baseDir = !override ? resolve(workspaceRoot) : isAbsolute(override) ? resolve(override) : resolve(workspaceRoot, override);
  return join(baseDir, resolvePluginWorkspaceId(settings));
}
