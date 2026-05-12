import type { Skill, MockDialogueEntry, OutputSectionTemplate } from '../../types';
import mockDialoguesData from './mock-dialogues.json';

// ============================================================
// JSON frontmatter parser
// ============================================================
// Each .md file has this format:
//   ---json
//   { ... metadata ... }
//   ---
//   (system prompt content)

interface SkillMetadata {
  id: string;
  name: string;
  description: string;
  hasMock: boolean;
  mockDialogueId?: string;
  outputLabel?: string;
  openingMessage: string;
  outputs: OutputSectionTemplate[];
}

function parseSkillMd(raw: string): { metadata: SkillMetadata; systemPrompt: string } {
  const match = raw.match(/^---json\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(
      'Invalid skill .md format. Expected:\n---json\n{...}\n---\nsystem prompt'
    );
  }
  try {
    const metadata: SkillMetadata = JSON.parse(match[1]);
    const systemPrompt = match[2].trim();
    return { metadata, systemPrompt };
  } catch (err) {
    throw new Error(`Failed to parse skill frontmatter: ${(err as Error).message}`);
  }
}

// ============================================================
// Auto-discover all .md skill files in this directory
// ============================================================
const skillModules = import.meta.glob('./*.md', { query: '?raw', import: 'default', eager: true });

// ============================================================
// Mock dialogues (keyed by id)
// ============================================================
const mockDialogues: Record<string, MockDialogueEntry[]> =
  mockDialoguesData as Record<string, MockDialogueEntry[]>;

function loadMockDialogue(id: string): MockDialogueEntry[] | undefined {
  return mockDialogues[id];
}

// ============================================================
// Build SKILLS array
// ============================================================
function buildSkills(): Skill[] {
  const skills: Skill[] = [];

  for (const [path, raw] of Object.entries(skillModules)) {
    // Skip non-markdown files (belt and suspenders)
    if (!path.endsWith('.md')) continue;

    const { metadata, systemPrompt } = parseSkillMd(raw as string);

    const skill: Skill = {
      id: metadata.id,
      name: metadata.name,
      description: metadata.description,
      systemPrompt,
      outputs: metadata.outputs,
      hasMock: metadata.hasMock,
      openingMessage: metadata.openingMessage,
      outputLabel: metadata.outputLabel,
    };

    if (metadata.hasMock && metadata.mockDialogueId) {
      const dialogue = loadMockDialogue(metadata.mockDialogueId);
      if (dialogue) {
        skill.mockDialogue = dialogue;
      }
    }

    skills.push(skill);
  }

  // Sort: skills with mock first, then by id
  skills.sort((a, b) => {
    if (a.hasMock !== b.hasMock) return a.hasMock ? -1 : 1;
    return a.id.localeCompare(b.id);
  });

  return skills;
}

export const SKILLS: Skill[] = buildSkills();

// ============================================================
// Public helpers (same API surface as before)
// ============================================================
export function getSkillById(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id);
}

export const DEFAULT_SKILL_ID = 'product-requirement-analyst';
