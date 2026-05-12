import * as fs from "fs";
import * as path from "path";

// ============================================================================
// Type Definitions
// ============================================================================

interface CandidateFamilies {
  version: number;
  families: Array<{
    id: string;
    title: string;
    members: string[];
    goal: string;
    status: string;
    preferredCore: string;
    preferredAdapters: string[];
    candidateDoc: string;
  }>;
}

interface RenderingConventions {
  version: number;
  hook: {
    stages: string[];
    actionTypes: string[];
  };
}

interface FamilyRenderingManifest {
  version: number;
  families: Array<{
    id: string;
    hook: {
      stage: string;
      event: string;
      actionType: string;
      actionRef: string;
    };
  }>;
}

interface HookAction {
  type: string;
  ref: string;
  input_map: Record<string, string>;
}

interface HookDescriptor {
  hook_id: string;
  title_zh: string;
  host: string;
  stage: string;
  enabled: boolean;
  when: {
    event: string;
    conditions: string[];
  };
  actions: HookAction[];
  source: {
    tooling_manifest: string;
    adapter_matrix: string;
    rendering_conventions: string;
  };
}

interface HookRenderInput {
  familyId: string;
  familyTitle: string;
  hostCapability: string;
  preferredCore: string;
  stage: string;
  event: string;
  actionType: string;
  actionRef: string;
  status: string;
}

interface HookRenderOutput {
  hookId: string;
  filePath: string;
  descriptor: HookDescriptor;
}

// ============================================================================
// Utility Functions
// ============================================================================

function readJsonFile<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}

function expandTemplate(template: string, variables: Record<string, string>): string {
  let expanded = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    expanded = expanded.split(placeholder).join(value);
  }
  return expanded;
}

function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ============================================================================
// Family Hook Configuration Provider
// ============================================================================

function getHookConfig(
  renderingManifest: FamilyRenderingManifest,
  familyId: string
): {
  stage: string;
  event: string;
  actionType: string;
  actionRef: string;
} {
  const familyRendering = renderingManifest.families.find((family) => family.id === familyId);
  if (!familyRendering) {
    throw new Error(`Unsupported family id for hook: ${familyId}`);
  }
  return familyRendering.hook;
}

// ============================================================================
// Hook Renderer
// ============================================================================

export function renderHook(
  input: HookRenderInput,
  templatePath: string,
  outputDir: string
): HookRenderOutput {
  const template = fs.readFileSync(templatePath, "utf-8");
  
  const hookId = `tokenflow-${input.familyId}-hook`;
  ensureDirectory(outputDir);

  const variables: Record<string, string> = {
    hook_id: hookId,
    title_zh: `TokenFlow ${input.familyTitle} Hook`,
    host_id: input.hostCapability,
    stage: input.stage,
    enabled_json: "true",
    event_name: input.event,
    conditions_json: JSON.stringify([
      `hostCapability == '${input.hostCapability}'`,
      `familyStatus == '${input.status}'`
    ], null, 2).split('\n').map((line, idx) => idx === 0 ? line : '    ' + line).join('\n'),
    actions_json: JSON.stringify([
      {
        type: input.actionType,
        ref: input.actionRef,
        input_map: {
          capability_id: input.preferredCore,
          family_id: input.familyId
        }
      }
    ], null, 2).split('\n').map((line, idx) => idx === 0 ? line : '  ' + line).join('\n')
  };

  const content = expandTemplate(template, variables);
  const filePath = path.join(outputDir, `tokenflow-${input.familyId}.json`);
  
  fs.writeFileSync(filePath, content, "utf-8");

  const descriptor: HookDescriptor = JSON.parse(content);

  return {
    hookId,
    filePath,
    descriptor
  };
}

export function renderAllHooks(
  manifestsDir: string,
  templatesDir: string,
  outputDir: string,
  hostCapability: string = "ide-agent"
): HookRenderOutput[] {
  const candidateFamilies = readJsonFile<CandidateFamilies>(
    path.join(manifestsDir, "candidate-families.json")
  );
  const familyRendering = readJsonFile<FamilyRenderingManifest>(
    path.join(manifestsDir, "family-rendering.json")
  );
  
  const templatePath = path.join(templatesDir, "hook", "hook.json.tmpl");
  const results: HookRenderOutput[] = [];

  for (const family of candidateFamilies.families) {
    if (!family.preferredAdapters.includes("hook")) {
      continue;
    }

    const hookConfig = getHookConfig(familyRendering, family.id);
    const input: HookRenderInput = {
      familyId: family.id,
      familyTitle: family.title,
      hostCapability,
      preferredCore: family.preferredCore,
      status: family.status,
      ...hookConfig
    };

    const result = renderHook(input, templatePath, outputDir);
    results.push(result);
  }

  return results;
}

// ============================================================================
// CLI Entry Point (for testing)
// ============================================================================

if (require.main === module) {
  const projectRoot = path.resolve(__dirname, "../..");
  const manifestsDir = path.join(projectRoot, "manifests");
  const templatesDir = path.join(projectRoot, "templates");
  const outputDir = path.join(projectRoot, "examples", "generated", "hook");

  console.log("Rendering hooks...");
  const results = renderAllHooks(manifestsDir, templatesDir, outputDir);
  
  console.log(`\nGenerated ${results.length} hooks:`);
  for (const result of results) {
    console.log(`  - ${result.hookId} -> ${result.filePath}`);
  }
}
