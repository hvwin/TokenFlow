import * as fs from "fs";
import * as path from "path";
import type { McpProjectedTool, McpToolSchemaProjection } from "./projection";
import type { McpRuntimeBundle, McpRuntimeEntryPlan } from "./runtime";

export interface LoaderConfig {
  projectionPath: string;
  serverEntryPath: string;
  gatewayEntryPath: string;
}

export type LoadedBundle = McpRuntimeBundle;

const DEFAULT_GENERATED_DIR = resolveDefaultGeneratedDir();

function resolveProjectRoot(): string {
  const candidates = [
    process.env.TOKENFLOW_PROJECT_ROOT,
    process.cwd(),
    path.resolve(__dirname, "../../.."),
    path.resolve(__dirname, "../..")
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "core", "capability-graph.json"))) {
      return candidate;
    }
  }

  return process.cwd();
}

function resolveDefaultGeneratedDir(): string {
  return path.resolve(resolveProjectRoot(), "examples/generated/mcp");
}

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function assertEntryPlan(entry: McpRuntimeEntryPlan, expectedShape: "server" | "gateway"): void {
  if (entry.adapterId !== "mcp") {
    throw new Error(`Invalid adapterId in ${expectedShape} entry: ${entry.adapterId}`);
  }
  if (entry.entryShape !== expectedShape) {
    throw new Error(`Expected ${expectedShape} entry shape, got: ${entry.entryShape}`);
  }
  if (entry.status !== "ready-for-runtime") {
    throw new Error(`${expectedShape} entry not ready: ${entry.status}`);
  }
}

function assertProjection(projection: McpToolSchemaProjection): void {
  if (projection.adapterId !== "mcp") {
    throw new Error(`Invalid projection adapterId: ${projection.adapterId}`);
  }
  if (projection.toolCount !== projection.tools.length) {
    throw new Error(
      `Projection toolCount mismatch: declared=${projection.toolCount} actual=${projection.tools.length}`
    );
  }
}

function assertBundleConsistency(
  projection: McpToolSchemaProjection,
  serverEntry: McpRuntimeEntryPlan,
  gatewayEntry: McpRuntimeEntryPlan
): void {
  const projectionToolIds = [...projection.toolIds].sort();
  const serverToolIds = [...serverEntry.toolIds].sort();
  const gatewayToolIds = [...gatewayEntry.toolIds].sort();

  if (JSON.stringify(projectionToolIds) !== JSON.stringify(serverToolIds)) {
    throw new Error("Tool IDs mismatch between projection and server entry");
  }

  if (JSON.stringify(projectionToolIds) !== JSON.stringify(gatewayToolIds)) {
    throw new Error("Tool IDs mismatch between projection and gateway entry");
  }
}

export function resolveLoaderConfig(baseDir: string = DEFAULT_GENERATED_DIR): LoaderConfig {
  return {
    projectionPath: path.join(baseDir, "tool-schema-projection.json"),
    serverEntryPath: path.join(baseDir, "server-entry.json"),
    gatewayEntryPath: path.join(baseDir, "gateway-entry.json")
  };
}

export function loadRuntimeBundle(config: LoaderConfig = resolveLoaderConfig()): LoadedBundle {
  const projection = readJsonFile<McpToolSchemaProjection>(config.projectionPath);
  const serverEntry = readJsonFile<McpRuntimeEntryPlan>(config.serverEntryPath);
  const gatewayEntry = readJsonFile<McpRuntimeEntryPlan>(config.gatewayEntryPath);

  assertProjection(projection);
  assertEntryPlan(serverEntry, "server");
  assertEntryPlan(gatewayEntry, "gateway");
  assertBundleConsistency(projection, serverEntry, gatewayEntry);

  return {
    projection,
    serverEntry,
    gatewayEntry
  };
}

export function getToolById(bundle: LoadedBundle, toolId: string): McpProjectedTool | undefined {
  return bundle.projection.tools.find((tool) => tool.tool_id === toolId);
}

export function getToolsByCapability(bundle: LoadedBundle, capability: string): McpProjectedTool[] {
  return bundle.projection.tools.filter((tool) => tool.capabilities.includes(capability));
}

export function getDefaultGeneratedDir(): string {
  return DEFAULT_GENERATED_DIR;
}
