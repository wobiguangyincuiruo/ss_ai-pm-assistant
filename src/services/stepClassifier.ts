import type { OutputSectionTemplate, OutputUpdate } from '../types';

/**
 * 从 AI 回复文本中解析输出章节更新。
 * @param responseText  AI 的完整回复
 * @param sections      当前 Skill 的 outputs 声明
 */
export function parseOutputUpdate(
  responseText: string,
  sections: OutputSectionTemplate[]
): OutputUpdate[] {
  const updates: OutputUpdate[] = [];

  // Build title → id map from skill's outputs
  const titleToId: Map<string, number> = new Map();
  for (const s of sections) {
    // Strip leading number prefix for matching: "1. 背景与目标" → "背景与目标"
    const cleanTitle = s.title.replace(/^\d+\.?\s*/, '');
    titleToId.set(cleanTitle, s.id);
  }

  // Try regex extraction: ## N. Title\nContent
  const sectionRegex = /##\s*\d*\.?\s*(.+?)\s*\n([\s\S]*?)(?=##\s|\Z)/gi;
  let match;
  while ((match = sectionRegex.exec(responseText)) !== null) {
    const title = match[1].trim();
    let content = match[2].trim();
    if (!content) continue;

    // Find matching section by title
    for (const [cleanTitle, id] of titleToId) {
      if (title.includes(cleanTitle) || cleanTitle.includes(title)) {
        // Extract mermaid diagram if present
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

  // Fallback: keyword-based detection
  if (updates.length === 0) {
    for (const s of sections) {
      const keywords = s.title.replace(/^\d+\.?\s*/, '');
      if (responseText.includes(keywords)) {
        const mermaidMatch = responseText.match(/```mermaid\s*\n([\s\S]*?)```/);
        updates.push({
          sectionId: s.id,
          content: responseText.trim(),
          mermaidDiagram: mermaidMatch ? mermaidMatch[1].trim() : undefined,
        });
        break;
      }
    }
  }

  return updates;
}
