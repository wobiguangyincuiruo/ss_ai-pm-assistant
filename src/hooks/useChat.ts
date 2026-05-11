import { useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { useAppState } from '../context/AppContext';
import { mockEngine } from '../services/mockEngine';
import { sendToClaude } from '../services/claudeApi';
import { classifyStep, parsePRDUpdate } from '../services/stepClassifier';
import type { Message } from '../types';

export function useChat() {
  const { state, dispatch } = useAppState();

  const sendMessage = useCallback(
    async (text: string, currentMessages: Message[]) => {
      const userMsg: Message = { id: uuid(), role: 'user', content: text, timestamp: Date.now() };
      dispatch({ type: 'ADD_MESSAGE', payload: userMsg });

      const history = [...currentMessages, userMsg];

      dispatch({ type: 'SET_TYPING', payload: true });

      try {
        let responseText: string;

        if (state.mode === 'mock') {
          responseText = await mockEngine.getNextResponse(history);
          const prdUpdates = mockEngine.getPRDUpdates(history);
          if (prdUpdates) {
            prdUpdates.forEach((update) => {
              dispatch({ type: 'UPDATE_PRD_SECTION', payload: update });
            });
          }
          const step = mockEngine.getCurrentStep(history);
          dispatch({ type: 'SET_CURRENT_STEP', payload: step });
        } else {
          responseText = await sendToClaude(history, state.apiKey);
          const prdUpdates = parsePRDUpdate(responseText);
          prdUpdates.forEach((update) => {
            dispatch({ type: 'UPDATE_PRD_SECTION', payload: update });
          });
          const step = classifyStep([...history]);
          dispatch({ type: 'SET_CURRENT_STEP', payload: step });
        }

        const assistantMsg: Message = {
          id: uuid(),
          role: 'assistant',
          content: responseText,
          timestamp: Date.now(),
        };
        dispatch({ type: 'ADD_MESSAGE', payload: assistantMsg });
      } catch (err) {
        const errorMsg: Message = {
          id: uuid(),
          role: 'assistant',
          content: '❌ ' + (err as Error).message,
          timestamp: Date.now(),
        };
        dispatch({ type: 'ADD_MESSAGE', payload: errorMsg });
      } finally {
        dispatch({ type: 'SET_TYPING', payload: false });
      }
    },
    [state.mode, state.apiKey, dispatch]
  );

  return { sendMessage };
}
