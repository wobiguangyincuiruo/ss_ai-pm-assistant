import React, { createContext, useContext, useReducer } from 'react';
import { v4 as uuid } from 'uuid';
import type { AppState, AppAction, PRD, StepNumber } from '../types';

const INITIAL_PRD: PRD = {
  sections: [
    { id: 1, title: '1. 背景与目标', content: '' },
    { id: 2, title: '2. 用户角色', content: '' },
    { id: 3, title: '3. 当前业务流程', content: '', mermaidDiagram: '' },
    { id: 4, title: '4. AI 能力介入点', content: '' },
    { id: 5, title: '5. 功能需求', content: '' },
    { id: 6, title: '6. 数据与接口需求', content: '' },
    { id: 7, title: '7. 非功能需求', content: '' },
    { id: 8, title: '8. 验收标准', content: '' },
  ],
};

const initialState: AppState = {
  mode: 'mock',
  apiKey: '',
  currentStep: 1 as StepNumber,
  messages: [],
  prd: INITIAL_PRD,
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
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'UPDATE_PRD_SECTION': {
      const newSections = state.prd.sections.map((s) =>
        s.id === action.payload.sectionId
          ? {
              ...s,
              content: action.payload.content,
              mermaidDiagram: action.payload.mermaidDiagram ?? s.mermaidDiagram,
            }
          : s
      );
      return { ...state, prd: { sections: newSections } };
    }
    case 'NEW_SESSION':
      return {
        ...initialState,
        sessionId: uuid(),
        mode: state.mode,
        apiKey: state.apiKey,
      };
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
