import * as fs from "fs";
import * as path from "path";

// ============================================================================
// Type Definitions
// ============================================================================

interface ToolingManifest {
  version: number;
  product: {
    name: string;
    repo: string;
    mode: string;
  };
  core: {
    modules: Array<{
      id: string;
      responsibility: string;
    }>;
  };
  candidateFamilies: Array<{
    id: string;
    title: string;
    status: string;
    preferredCore: string;
    preferredAdapters: string[];
  }>;
}

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

interface FamilyRenderingManifest {
  version: number;
  families: Array<{
    id: string;
    skill: {
      purposeZh: string;
      triggerKeywordsZh: string;
      boundariesZh: string;
    };
  }>;
}

interface SkillRenderInput {
  familyId: string;
  familyTitle: string;
  preferredCore: string;
  preferredAdapters: string[];
  purposeZh: string;
  triggerKeywordsZh: string;
  boundariesZh: string;
}

interface SkillRenderOutput {
  skillName: string;
  filePath: string;
  content: string;
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

function getFamilyCopy(
  renderingManifest: FamilyRenderingManifest,
  familyId: string
): {
  purposeZh: string;
  triggerKeywordsZh: string;
  boundariesZh: string;
} {
  const familyRendering = renderingManifest.families.find((family) => family.id === familyId);
  if (!familyRendering) {
    throw new Error(`Unsupported family id: ${familyId}`);
  }
  return familyRendering.skill;
}

// ============================================================================
// Skill Renderer
// ============================================================================

export function renderSkill(
  input: SkillRenderInput,
  templatePath: string,
  outputDir: string
): SkillRenderOutput {
  const template = fs.readFileSync(templatePath, "utf-8");
  
  const skillName = `tokenflow-${input.familyId}`;
  const skillDir = path.join(outputDir, input.familyId);
  ensureDirectory(skillDir);

  const variables: Record<string, string> = {
    skill_name: skillName,
    skill_description_zh: `用途：${input.purposeZh} 触发关键词：${input.triggerKeywordsZh}。边界：${input.boundariesZh}`,
    skill_title_zh: `TokenFlow ${input.familyTitle} Skill`,
    purpose_zh: input.purposeZh,
    trigger_keywords_zh: input.triggerKeywordsZh,
    boundaries_zh: input.boundariesZh,
    capability_ids_csv: input.preferredCore,
    tool_ids_csv: input.preferredAdapters.join(", ")
  };

  const content = expandTemplate(template, variables);
  const filePath = path.join(skillDir, "SKILL.md");
  
  fs.writeFileSync(filePath, content, "utf-8");

  return {
    skillName,
    filePath,
    content
  };
}

export function renderAllSkills(
  manifestsDir: string,
  templatesDir: string,
  outputDir: string
): SkillRenderOutput[] {
  const candidateFamilies = readJsonFile<CandidateFamilies>(
    path.join(manifestsDir, "candidate-families.json")
  );
  const familyRendering = readJsonFile<FamilyRenderingManifest>(
    path.join(manifestsDir, "family-rendering.json")
  );
  
  const templatePath = path.join(templatesDir, "skill", "SKILL.md.tmpl");
  const results: SkillRenderOutput[] = [];

  for (const family of candidateFamilies.families) {
    if (!family.preferredAdapters.includes("skill")) {
      continue;
    }

    const copy = getFamilyCopy(familyRendering, family.id);
    const input: SkillRenderInput = {
      familyId: family.id,
      familyTitle: family.title,
      preferredCore: family.preferredCore,
      preferredAdapters: family.preferredAdapters,
      ...copy
    };

    const result = renderSkill(input, templatePath, outputDir);
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
  const outputDir = path.join(projectRoot, "examples", "generated", "skill");

  console.log("Rendering skills...");
  const results = renderAllSkills(manifestsDir, templatesDir, outputDir);
  
  console.log(`\nGenerated ${results.length} skills:`);
  for (const result of results) {
    console.log(`  - ${result.skillName} -> ${result.filePath}`);
  }
}
