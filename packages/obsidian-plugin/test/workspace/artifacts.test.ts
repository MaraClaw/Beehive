import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { BEEHIVE_WORKSPACE_ID_ENV } from "../../src/constants";
import { resolvePluginWorkspaceId, workspaceArtifactRoot, workspaceCliEnv } from "../../src/workspace/artifacts";

const previousOut = process.env.BEEHIVE_OUT;

afterEach(() => {
  if (previousOut === undefined) {
    delete process.env.BEEHIVE_OUT;
  } else {
    process.env.BEEHIVE_OUT = previousOut;
  }
});

describe("workspace artifact helpers", () => {
  it("resolves the configured workspace id and artifact root", () => {
    const settings = { workspaceId: "research" };

    expect(resolvePluginWorkspaceId(settings)).toBe("research");
    expect(workspaceArtifactRoot("/vault", settings)).toBe(path.join("/vault", "research"));
  });

  it("provides BEEHIVE_WORKSPACE_ID for plugin CLI invocations", () => {
    const env = workspaceCliEnv({ workspaceId: "obsidian" });

    expect(env[BEEHIVE_WORKSPACE_ID_ENV]).toBe("obsidian");
  });

  it("falls back to a safe default for empty ids", () => {
    expect(resolvePluginWorkspaceId({ workspaceId: "" })).toBe("default");
  });

  it("rejects unsafe workspace ids instead of silently changing workspaces", () => {
    expect(() => resolvePluginWorkspaceId({ workspaceId: "../outside" })).toThrow("Invalid Beehive workspace ID");
    expect(() => resolvePluginWorkspaceId({ workspaceId: "foo/bar" })).toThrow("Invalid Beehive workspace ID");
  });

  it("respects relative BEEHIVE_OUT when resolving artifact roots", () => {
    process.env.BEEHIVE_OUT = ".beehive-out";

    expect(workspaceArtifactRoot("/vault", { workspaceId: "research" })).toBe(path.join("/vault", ".beehive-out", "research"));
  });

  it("respects absolute BEEHIVE_OUT when resolving artifact roots", () => {
    process.env.BEEHIVE_OUT = path.join(path.sep, "artifacts");

    expect(workspaceArtifactRoot("/vault", { workspaceId: "research" })).toBe(path.join(path.sep, "artifacts", "research"));
  });
});
