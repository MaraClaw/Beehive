import { buildContextPack, readContextPack, renderContextPackLlms, renderContextPackMarkdown } from "./context-packs.js";
import {
  applyMemoryTaskContextMetadata,
  createMemoryTaskDraft,
  type MemoryTaskContextMetadata,
  persistMemoryTaskRecord,
  readMemoryTask,
  updateMemoryTaskRecord
} from "./memory-store.js";
import type {
  AgentMemoryResumeFormat,
  AgentMemoryTask,
  AgentMemoryTaskResult,
  ContextPack,
  ResumeMemoryTaskOptions,
  ResumeMemoryTaskResult,
  StartMemoryTaskOptions,
  UpdateMemoryTaskOptions
} from "./types.js";

export type { MemoryTaskStoredPage } from "./memory-store.js";
export {
  buildMemoryGraphElements,
  ensureMemoryLedger,
  estimateMemoryTaskTokens,
  finishMemoryTask,
  listMemoryTasks,
  loadMemoryTaskPages,
  memoryTaskHashes,
  memoryTaskPageRecord,
  readMemoryTask,
  renderMemoryTaskMarkdown
} from "./memory-store.js";

const DEFAULT_MEMORY_CONTEXT_BUDGET = 8000;

function contextMetadataFromId(contextPackId: string): MemoryTaskContextMetadata {
  return { id: contextPackId, relatedSourceIds: [], relatedPageIds: [], relatedNodeIds: [] };
}

function contextMetadataFromPack(pack: ContextPack): MemoryTaskContextMetadata {
  return {
    id: pack.id,
    relatedSourceIds: pack.relatedSourceIds,
    relatedPageIds: pack.relatedPageIds,
    relatedNodeIds: pack.relatedNodeIds
  };
}

async function resolveContextMetadata(rootDir: string, contextPackId: string): Promise<MemoryTaskContextMetadata> {
  const pack = await readContextPack(rootDir, contextPackId);
  return pack ? contextMetadataFromPack(pack) : contextMetadataFromId(contextPackId);
}

async function hydrateTaskFromContextPack(rootDir: string, task: AgentMemoryTask, contextPackId: string): Promise<AgentMemoryTask> {
  return applyMemoryTaskContextMetadata(task, await resolveContextMetadata(rootDir, contextPackId));
}

export async function startMemoryTask(rootDir: string, options: StartMemoryTaskOptions): Promise<AgentMemoryTaskResult> {
  let task = await createMemoryTaskDraft(rootDir, options);
  if (options.contextPackId) {
    task = await hydrateTaskFromContextPack(rootDir, task, options.contextPackId);
  } else {
    const pack = await buildContextPack(rootDir, {
      goal: task.goal,
      target: options.target,
      budgetTokens: options.budgetTokens ?? DEFAULT_MEMORY_CONTEXT_BUDGET,
      format: "markdown"
    });
    task = applyMemoryTaskContextMetadata(task, contextMetadataFromPack(pack.pack));
  }
  return await persistMemoryTaskRecord(rootDir, task);
}

export async function updateMemoryTask(rootDir: string, target: string, options: UpdateMemoryTaskOptions): Promise<AgentMemoryTaskResult> {
  const metadata = options.contextPackId ? await resolveContextMetadata(rootDir, options.contextPackId) : undefined;
  return await updateMemoryTaskRecord(rootDir, target, options, metadata);
}

function markdownList(values: string[], empty = "- none"): string {
  return values.length ? values.map((value) => `- ${value}`).join("\n") : empty;
}

function datedList(values: Array<{ text: string; createdAt: string }>, empty = "- none"): string {
  return values.length ? values.map((value) => `- ${value.text} (${value.createdAt})`).join("\n") : empty;
}

function renderMemoryResumeMarkdown(task: AgentMemoryTask, contextSections: string[]): string {
  return [
    `# Agent Task Resume: ${task.title}`,
    "",
    `Goal: ${task.goal}`,
    `Status: ${task.status}`,
    task.target ? `Target: ${task.target}` : undefined,
    task.agent ? `Agent: ${task.agent}` : undefined,
    "",
    "## Outcome",
    "",
    task.outcome ?? "Not finished yet.",
    "",
    "## Decisions",
    "",
    datedList(task.decisions),
    "",
    "## Follow-Ups",
    "",
    markdownList(task.followUps),
    "",
    "## Changed Paths",
    "",
    markdownList(task.changedPaths),
    "",
    "## Linked Context",
    "",
    contextSections.length ? contextSections.join("\n\n---\n\n") : "- none",
    ""
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");
}

export async function resumeMemoryTask(
  rootDir: string,
  target: string,
  options: ResumeMemoryTaskOptions = {}
): Promise<ResumeMemoryTaskResult> {
  const task = await readMemoryTask(rootDir, target);
  if (!task) {
    throw new Error(`Task not found: ${target}`);
  }
  const format: AgentMemoryResumeFormat = options.format ?? "markdown";
  if (format === "json") {
    return { task, rendered: JSON.stringify(task, null, 2) };
  }
  const packs = (
    await Promise.all(
      task.contextPackIds.map(async (id) => {
        const pack = await readContextPack(rootDir, id);
        if (!pack) {
          return null;
        }
        return format === "llms" ? renderContextPackLlms(pack) : renderContextPackMarkdown(pack);
      })
    )
  ).filter((value): value is string => Boolean(value));
  return {
    task,
    rendered: renderMemoryResumeMarkdown(task, packs)
  };
}
