import React, { createContext, useContext, useReducer } from 'react';
import { v4 as uuid } from 'uuid';
import type { AppState, AppAction, OutputSection } from '../types';
import { getSkillById, DEFAULT_SKILL_ID } from '../data/skills';

function buildInitialOutput(skillId: string): OutputSection[] {
  const skill = getSkillById(skillId);
  if (!skill) return [];
  return skill.outputs.map((tpl) => ({
    id: tpl.id,
    title: tpl.title,
    content: '',
  }));
}

const defaultSkill = getSkillById(DEFAULT_SKILL_ID)!;

const initialState: AppState = {
  mode: 'mock',
  apiProvider: 'deepseek',
  apiKey: '',
  model: 'deepseek-chat',
  apiBaseUrl: '',
  currentSkillId: DEFAULT_SKILL_ID,
  messages: [],
  output: { sections: buildInitialOutput(DEFAULT_SKILL_ID) },
  isTyping: false,
  sessionId: uuid(),
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };

    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };

    case 'SET_MODE':
      return { ...state, mode: action.payload };

    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload };

    case 'SET_MODEL':
      return { ...state, model: action.payload };

    case 'SET_API_PROVIDER':
      return { ...state, apiProvider: action.payload };

    case 'SET_API_BASE_URL':
      return { ...state, apiBaseUrl: action.payload };

    case 'UPDATE_OUTPUT_SECTION': {
      const newSections = state.output.sections.map((s) =>
        s.id === action.payload.sectionId
          ? {
              ...s,
              content: action.payload.content,
              mermaidDiagram: action.payload.mermaidDiagram ?? s.mermaidDiagram,
            }
          : s
      );
      return { ...state, output: { sections: newSections } };
    }

    case 'NEW_SESSION':
      return {
        ...state,
        messages: [],
        output: { sections: buildInitialOutput(state.currentSkillId) },
        isTyping: false,
        sessionId: uuid(),
      };

    case 'LOAD_SKILL': {
      const skill = getSkillById(action.payload.skillId);
      const forcedMode = skill && !skill.hasMock ? 'api' : state.mode;
      return {
        ...state,
        mode: forcedMode,
        currentSkillId: action.payload.skillId,
        messages: [],
        output: { sections: action.payload.outputSections },
        isTyping: false,
        sessionId: uuid(),
      };
    }

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
