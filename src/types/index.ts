// ============================================================
// Mode & API Provider
// ============================================================
export type AppMode = 'mock' | 'api';
export type ApiProvider = 'anthropic' | 'deepseek' | 'openai' | 'custom';

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
// Session history
// ============================================================
export interface SessionMeta {
  id: string;
  title: string;
  skillId: string;
  skillName: string;
  messageCount: number;
  preview: string;
  createdAt: number;
  updatedAt: number;
}

export interface SessionData {
  meta: SessionMeta;
  messages: Message[];
  output: OutputDocument;
  apiProvider: ApiProvider;
  model: string;
  apiBaseUrl: string;
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
  apiProvider: ApiProvider;
  apiKey: string;
  model: string;
  apiBaseUrl: string;
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
  | { type: 'SET_API_PROVIDER'; payload: ApiProvider }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'SET_API_BASE_URL'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'UPDATE_OUTPUT_SECTION'; payload: OutputUpdate }
  | { type: 'NEW_SESSION' }
  | { type: 'LOAD_SKILL'; payload: { skillId: string; outputSections: OutputSection[] } }
  | { type: 'LOAD_SESSION'; payload: SessionData };
