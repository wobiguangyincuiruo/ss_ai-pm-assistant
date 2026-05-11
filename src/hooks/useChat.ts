import { useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { useAppState } from '../context/AppContext';
import { getSkillById } from '../data/skills';
import { createMockEngine } from '../services/mockEngine';
import { sendToClaude } from '../services/claudeApi';
import { parseOutputUpdate } from '../services/stepClassifier';
import type { Message } from '../types';

export function useChat() {
  const { state, dispatch } = useAppState();

  const sendMessage = useCallback(
    async (text: string, currentMessages: Message[]) => {
      const userMsg: Message = {
        id: uuid(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: userMsg });

      const history = [...currentMessages, userMsg];
      dispatch({ type: 'SET_TYPING', payload: true });

      const skill = getSkillById(state.currentSkillId);

      try {
        let responseText: string;

        if (state.mode === 'mock' && skill?.hasMock && skill.mockDialogue) {
          const engine = createMockEngine(skill.mockDialogue);
          responseText = await engine.getNextResponse(history);
          const outputUpdates = engine.getOutputUpdates(history);
          if (outputUpdates) {
            outputUpdates.forEach((update) => {
              dispatch({ type: 'UPDATE_OUTPUT_SECTION', payload: update });
            });
          }
        } else {
          if (!skill) throw new Error('当前技能未找到');
          responseText = await sendToClaude(history, state.apiKey, skill.systemPrompt);
          const outputUpdates = parseOutputUpdate(responseText, skill.outputs);
          outputUpdates.forEach((update) => {
            dispatch({ type: 'UPDATE_OUTPUT_SECTION', payload: update });
          });
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
    [state.mode, state.apiKey, state.currentSkillId, dispatch]
  );

  return { sendMessage };
}
