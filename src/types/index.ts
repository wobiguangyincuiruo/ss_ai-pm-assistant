// ============================================================
// Mode
// ============================================================
export type AppMode = 'mock' | 'api';

// ============================================================
// Messages
// ============================================================
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// ============================================================
// Output (renamed from PRD)
// ============================================================

/** A section template defined by a skill's outputs declaration */
export interface OutputSectionTemplate {
  id: number;
  title: string;
}

/** A live section with content filled by AI responses */
export interface OutputSection {
  id: number;
  title: string;
  content: string;
  mermaidDiagram?: string;
}

/** The full output document */
export interface OutputDocument {
  sections: OutputSection[];
}

/** A single section update extracted from an AI response */
export interface OutputUpdate {
  sectionId: number;
  content: string;
  mermaidDiagram?: string;
}

// ============================================================
// Skill definition
// ============================================================
export interface MockDialogueEntry {
  assistantMessage: string;
  outputUpdates?: OutputUpdate[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  outputs: OutputSectionTemplate[];
  hasMock: boolean;
  mockDialogue?: MockDialogueEntry[];
  openingMessage: string;
  outputLabel?: string;
}

// ============================================================
// AppState
// ============================================================
export interface AppState {
  mode: AppMode;
  apiKey: string;
  currentSkillId: string;
  messages: Message[];
  output: OutputDocument;
  isTyping: boolean;
  sessionId: string;
}

// ============================================================
// Reducer actions
// ============================================================
export type AppAction =
  | { type: 'SET_MODE'; payload: AppMode }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'UPDATE_OUTPUT_SECTION'; payload: OutputUpdate }
  | { type: 'NEW_SESSION' }
  | { type: 'LOAD_SKILL'; payload: { skillId: string; outputSections: OutputSection[] } };
