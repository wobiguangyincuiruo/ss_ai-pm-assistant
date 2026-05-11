import { MOCK_DIALOGUE } from '../data/mockDialogue';
import type { Message, PRDUpdate } from '../types';

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockEngine = {
  async getNextResponse(history: Message[]): Promise<string> {
    const count = history.filter((m) => m.role === 'assistant').length;
    await delay(800 + Math.random() * 700);
    if (count >= MOCK_DIALOGUE.length) {
      return '感谢您的反馈！如果您还有其他需求，请随时告诉我。';
    }
    return MOCK_DIALOGUE[count].assistantMessage;
  },

  getPRDUpdates(history: Message[]): PRDUpdate[] | undefined {
    const count = history.filter((m) => m.role === 'assistant').length;
    if (count > 0 && count <= MOCK_DIALOGUE.length) {
      return MOCK_DIALOGUE[count - 1].prdUpdates;
    }
    return undefined;
  },

  getCurrentStep(history: Message[]): 1 | 2 | 3 | 4 {
    const count = history.filter((m) => m.role === 'assistant').length;
    if (count > 0 && count <= MOCK_DIALOGUE.length) {
      return MOCK_DIALOGUE[count - 1].step;
    }
    return 1;
  },
};
