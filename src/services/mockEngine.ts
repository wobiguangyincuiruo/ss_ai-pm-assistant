import type { Message, MockDialogueEntry, OutputUpdate } from '../types';

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function createMockEngine(dialogue: MockDialogueEntry[]) {
  return {
    async getNextResponse(history: Message[]): Promise<string> {
      const count = history.filter((m) => m.role === 'assistant').length;
      await delay(800 + Math.random() * 700);
      if (count >= dialogue.length) {
        return '感谢您的反馈！如果您还有其他需求，请随时告诉我。';
      }
      return dialogue[count].assistantMessage;
    },

    getOutputUpdates(history: Message[]): OutputUpdate[] | undefined {
      const count = history.filter((m) => m.role === 'assistant').length;
      if (count > 0 && count <= dialogue.length) {
        return dialogue[count - 1].outputUpdates;
      }
      return undefined;
    },
  };
}
