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
  command: {
    entryKinds: string[];
  };
}

interface FamilyRenderingManifest {
  version: number;
  families: Array<{
    id: string;
    command: {
      entryKind: string;
      entryRef: string;
      arguments: CommandArgument[];
    };
  }>;
}

interface CommandArgument {
  name: string;
  type: string;
  required: boolean;
  description_zh: string;
}

interface CommandDescriptor {
  command_id: string;
  title_zh: string;
  host: string;
  entry: {
    kind: string;
    ref: string;
  };
  arguments: CommandArgument[];
  capabilities: string[];
  source: {
    tooling_manifest: string;
    adapter_matrix: string;
    rendering_conventions: string;
  };
}

interface CommandRenderInput {
  familyId: string;
  familyTitle: string;
  hostCapability: string;
  preferredCore: string;
  entryKind: string;
  entryRef: string;
  arguments: CommandArgument[];
}

interface CommandRenderOutput {
  commandId: string;
  filePath: string;
  descriptor: CommandDescriptor;
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
// Family Command Configuration Provider
// ============================================================================

function getCommandConfig(
  renderingManifest: FamilyRenderingManifest,
  familyId: string
): {
  entryKind: string;
  entryRef: string;
  arguments: CommandArgument[];
} {
  const familyRendering = renderingManifest.families.find((family) => family.id === familyId);
  if (!familyRendering) {
    throw new Error(`Unsupported family id for command: ${familyId}`);
  }
  return familyRendering.command;
}

// ============================================================================
// Command Renderer
// ============================================================================

export function renderCommand(
  input: CommandRenderInput,
  templatePath: string,
  outputDir: string
): CommandRenderOutput {
  const template = fs.readFileSync(templatePath, "utf-8");
  
  const commandId = `tokenflow-${input.familyId}`;
  ensureDirectory(outputDir);

  const variables: Record<string, string> = {
    command_id: commandId,
    title_zh: `TokenFlow ${input.familyTitle} Command`,
    host_id: input.hostCapability,
    entry_kind: input.entryKind,
    entry_ref: input.entryRef,
    arguments_json: JSON.stringify(input.arguments, null, 2).split('\n').map((line, idx) => idx === 0 ? line : '  ' + line).join('\n'),
    capabilities_json: JSON.stringify([input.preferredCore], null, 2).split('\n').map((line, idx) => idx === 0 ? line : '  ' + line).join('\n')
  };

  const content = expandTemplate(template, variables);
  const filePath = path.join(outputDir, `tokenflow-${input.familyId}.json`);
  
  fs.writeFileSync(filePath, content, "utf-8");

  const descriptor: CommandDescriptor = JSON.parse(content);

  return {
    commandId,
    filePath,
    descriptor
  };
}

export function renderAllCommands(
  manifestsDir: string,
  templatesDir: string,
  outputDir: string,
  hostCapability: string = "ide-agent"
): CommandRenderOutput[] {
  const candidateFamilies = readJsonFile<CandidateFamilies>(
    path.join(manifestsDir, "candidate-families.json")
  );
  const familyRendering = readJsonFile<FamilyRenderingManifest>(
    path.join(manifestsDir, "family-rendering.json")
  );
  
  const templatePath = path.join(templatesDir, "command", "command.json.tmpl");
  const results: CommandRenderOutput[] = [];

  for (const family of candidateFamilies.families) {
    if (!family.preferredAdapters.includes("command")) {
      continue;
    }

    const commandConfig = getCommandConfig(familyRendering, family.id);
    const input: CommandRenderInput = {
      familyId: family.id,
      familyTitle: family.title,
      hostCapability,
      preferredCore: family.preferredCore,
      ...commandConfig
    };

    const result = renderCommand(input, templatePath, outputDir);
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
  const outputDir = path.join(projectRoot, "examples", "generated", "command");

  console.log("Rendering commands...");
  const results = renderAllCommands(manifestsDir, templatesDir, outputDir);
  
  console.log(`\nGenerated ${results.length} commands:`);
  for (const result of results) {
    console.log(`  - ${result.commandId} -> ${result.filePath}`);
  }
}
