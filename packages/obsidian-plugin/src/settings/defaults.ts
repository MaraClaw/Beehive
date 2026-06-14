import type { CliOutputMode } from "../types";

export interface BeehiveSettings {
  cliBinary: string;
  workspaceRootOverride: string;
  workspaceId: string;
  defaultQueryOutputMode: CliOutputMode;
  autoCompileOnRawChange: boolean;
  deepLintOnSave: boolean;
  pollIntervalSeconds: number;
  extraArgs: string;
}

export const DEFAULT_SETTINGS: BeehiveSettings = {
  cliBinary: "",
  workspaceRootOverride: "",
  workspaceId: "default",
  defaultQueryOutputMode: "append-note",
  autoCompileOnRawChange: false,
  deepLintOnSave: false,
  pollIntervalSeconds: 0,
  extraArgs: ""
};

export function mergeSettings(partial: Partial<BeehiveSettings> | null | undefined): BeehiveSettings {
  return { ...DEFAULT_SETTINGS, ...(partial ?? {}) };
}
