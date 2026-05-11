import type { Message, PRDUpdate, StepNumber } from '../types';

export function classifyStep(history: Message[]): StepNumber {
  const lastAssistant = [...history].reverse().find((m) => m.role === 'assistant')?.content || '';

  if (
    lastAssistant.includes('产品需求文档') ||
    lastAssistant.includes('验收标准') ||
    lastAssistant.includes('功能需求') ||
    lastAssistant.includes('确认')
  ) {
    return 4;
  }

  if (
    lastAssistant.includes('自动助手') ||
    lastAssistant.includes('固定的规则') ||
    lastAssistant.includes('信息整合') ||
    lastAssistant.includes('预测') ||
    lastAssistant.includes('历史情况')
  ) {
    return 3;
  }

  if (
    lastAssistant.includes('文件或信息') ||
    lastAssistant.includes('重复做') ||
    lastAssistant.includes('查找或比对') ||
    lastAssistant.includes('谁会用到')
  ) {
    return 2;
  }

  return 1;
}

const SECTION_PATTERNS: Array<{ sectionId: number; keywords: string[] }> = [
  { sectionId: 1, keywords: ['背景与目标', '业务场景', '当前痛点', '预期收益'] },
  { sectionId: 2, keywords: ['用户角色', '主要使用者', '次要使用者'] },
  { sectionId: 3, keywords: ['当前业务流程', '步骤'] },
  { sectionId: 4, keywords: ['AI能力介入点', '介入点'] },
  { sectionId: 5, keywords: ['功能需求', '用户故事'] },
  { sectionId: 6, keywords: ['数据与接口需求', '输入数据', '输出数据'] },
  { sectionId: 7, keywords: ['非功能需求', '响应速度', '准确率'] },
  { sectionId: 8, keywords: ['验收标准'] },
];

export function parsePRDUpdate(responseText: string): PRDUpdate[] {
  const updates: PRDUpdate[] = [];

  // Try regex extraction first (## N. Title format)
  const sectionRegex = /##\s*\d*\.?\s*(.+?)\s*\n([\s\S]*?)(?=##\s|\Z)/gi;
  let match;
  const titleToSectionId: Record<string, number> = {
    '背景与目标': 1,
    '用户角色': 2,
    '当前业务流程': 3,
    'AI能力介入点': 4,
    '功能需求': 5,
    '数据与接口需求': 6,
    '非功能需求': 7,
    '验收标准': 8,
  };

  while ((match = sectionRegex.exec(responseText)) !== null) {
    const title = match[1].replace(/^\d+\.?\s*/, '').trim();
    const content = match[2].trim();
    for (const [key, id] of Object.entries(titleToSectionId)) {
      if (title.includes(key) && content) {
        const mermaidMatch = content.match(/```mermaid\s*\n([\s\S]*?)```/);
        updates.push({
          sectionId: id,
          content,
          mermaidDiagram: mermaidMatch ? mermaidMatch[1].trim() : undefined,
        });
        break;
      }
    }
  }

  // Fallback: keyword-based detection for loosely formatted responses
  if (updates.length === 0) {
    for (const pattern of SECTION_PATTERNS) {
      const found = pattern.keywords.some((kw) => responseText.includes(kw));
      if (found) {
        const mermaidMatch = responseText.match(/```mermaid\s*\n([\s\S]*?)```/);
        updates.push({
          sectionId: pattern.sectionId,
          content: responseText.trim(),
          mermaidDiagram: mermaidMatch ? mermaidMatch[1].trim() : undefined,
        });
        break; // Only match the strongest single section in fallback mode
      }
    }
  }

  return updates;
}
