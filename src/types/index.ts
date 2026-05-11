export type AppMode = 'mock' | 'api';
export type StepNumber = 1 | 2 | 3 | 4;

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface PRDSection {
  id: number;
  title: string;
  content: string;
  mermaidDiagram?: string;
}

export interface PRD {
  sections: PRDSection[];
}

export interface AppState {
  mode: AppMode;
  apiKey: string;
  currentStep: StepNumber;
  messages: Message[];
  prd: PRD;
  isTyping: boolean;
  sessionId: string;
}

export interface PRDUpdate {
  sectionId: number;
  content: string;
  mermaidDiagram?: string;
}

export type AppAction =
  | { type: 'SET_MODE'; payload: AppMode }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_CURRENT_STEP'; payload: StepNumber }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'UPDATE_PRD_SECTION'; payload: PRDUpdate }
  | { type: 'NEW_SESSION' };
