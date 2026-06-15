import type BeehivePlugin from "../main";
import { runAdd, runCompile, runIngest, runInit, runLint } from "./core";
import { runWatchOnce, showWatchStatus, startServe, startWatch, stopServe, stopWatch } from "./processes";
import { runAsk, runQueryFromNote } from "./query";

export function registerCommands(plugin: BeehivePlugin): void {
  plugin.addCommand({
    id: "beehive-init",
    name: "Init workspace",
    callback: () => void runInit(plugin)
  });
  plugin.addCommand({
    id: "beehive-ingest",
    name: "Ingest path or URL",
    callback: () => void runIngest(plugin)
  });
  plugin.addCommand({
    id: "beehive-add",
    name: "Add URL",
    callback: () => void runAdd(plugin)
  });
  plugin.addCommand({
    id: "beehive-compile",
    name: "Compile",
    callback: () => void runCompile(plugin)
  });
  plugin.addCommand({
    id: "beehive-lint",
    name: "Lint",
    callback: () => void runLint(plugin)
  });
  plugin.addCommand({
    id: "beehive-query-from-note",
    name: "Query from current note",
    callback: () => runQueryFromNote(plugin)
  });
  plugin.addCommand({
    id: "beehive-ask",
    name: "Ask question",
    callback: () => runAsk(plugin)
  });
  plugin.addCommand({
    id: "beehive-watch-start",
    name: "Watch: start",
    callback: () => void startWatch(plugin)
  });
  plugin.addCommand({
    id: "beehive-watch-stop",
    name: "Watch: stop",
    callback: () => stopWatch(plugin)
  });
  plugin.addCommand({
    id: "beehive-watch-once",
    name: "Watch: run once",
    callback: () => void runWatchOnce(plugin)
  });
  plugin.addCommand({
    id: "beehive-watch-status",
    name: "Watch: status",
    callback: () => void showWatchStatus(plugin)
  });
  plugin.addCommand({
    id: "beehive-serve-start",
    name: "Graph viewer: start server",
    callback: () => void startServe(plugin)
  });
  plugin.addCommand({
    id: "beehive-serve-stop",
    name: "Graph viewer: stop server",
    callback: () => stopServe(plugin)
  });
}
