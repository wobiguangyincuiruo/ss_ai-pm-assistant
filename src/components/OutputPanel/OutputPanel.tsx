import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { getSkillById } from '../../data/skills';
import { MermaidDiagram } from './MermaidDiagram';

const panelStyle: React.CSSProperties = {
  flex: 2,
  overflow: 'auto',
  padding: 20,
  borderLeft: '1px solid #e8e8e8',
  backgroundColor: '#fff',
};

const emptyStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#bfbfbf',
  fontSize: 14,
  textAlign: 'center',
};

const sectionHeaderStyle: React.CSSProperties = {
  cursor: 'pointer',
  fontWeight: 600,
  padding: '10px 0',
  borderBottom: '1px solid #f0f0f0',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 14,
  color: '#333',
  userSelect: 'none',
};

const sectionBodyStyle: React.CSSProperties = {
  padding: '12px 0 12px 20px',
  fontSize: 13,
  lineHeight: 1.8,
  color: '#555',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: 15,
  fontWeight: 700,
  color: '#1a1a1a',
};

export function OutputPanel() {
  const { state } = useAppState();
  const skill = getSkillById(state.currentSkillId);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1, 2, 3]));

  const toggleSection = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filledSections = state.output.sections.filter((s) => s.content.length > 0);

  if (filledSections.length === 0) {
    return (
      <div style={panelStyle}>
        <div style={emptyStyle}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          {skill?.description ?? '输出文档将在对话过程中逐步生成...'}
          <br />
          <span style={{ fontSize: 12, marginTop: 8 }}>
            当 AI 收集到足够信息后，右侧将自动填充对应章节
          </span>
        </div>
      </div>
    );
  }

  const skillName = skill?.name ?? '数字员工';
  const outputLabel = skill?.outputLabel ?? '文档';

  const handleExport = () => {
    const md = filledSections
      .map((s) => {
        let block = `## ${s.title}\n\n${s.content}`;
        if (s.mermaidDiagram) {
          block += `\n\n\`\`\`mermaid\n${s.mermaidDiagram}\n\`\`\``;
        }
        return block;
      })
      .join('\n\n---\n\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skillName}_${outputLabel}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={panelStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <h3 style={titleStyle}>输出文档</h3>
        <button
          onClick={handleExport}
          style={{
            padding: '4px 12px',
            fontSize: 12,
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            backgroundColor: '#fff',
            cursor: 'pointer',
            color: '#666',
          }}
        >
          导出 Markdown
        </button>
      </div>
      {state.output.sections.map((section) =>
        section.content ? (
          <div key={section.id}>
            <div style={sectionHeaderStyle} onClick={() => toggleSection(section.id)}>
              <span style={{ fontSize: 12, width: 16 }}>
                {expanded.has(section.id) ? '▾' : '▸'}
              </span>
              {section.title}
              {section.mermaidDiagram && (
                <span style={{ fontSize: 10, color: '#1677ff', marginLeft: 4 }}>[流程图]</span>
              )}
            </div>
            {expanded.has(section.id) && (
              <div style={sectionBodyStyle}>
                <div dangerouslySetInnerHTML={{ __html: formatContent(section.content) }} />
                {section.mermaidDiagram && (
                  <div style={{ marginTop: 12 }}>
                    <MermaidDiagram chart={section.mermaidDiagram} />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null
      )}
    </div>
  );
}

function formatContent(md: string): string {
  return md
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^(\d+)\.\s(.+)$/gm, '<li>$2</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}
