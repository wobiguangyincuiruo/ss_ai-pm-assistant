import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { getSkillById } from '../../data/skills';
import { MermaidDiagram } from './MermaidDiagram';

const panelStyle: React.CSSProperties = {
  flex: 2,
  overflow: 'auto',
  padding: '24px 28px',
  borderLeft: '1px solid #f0f0ec',
  backgroundColor: '#fff',
};

const emptyStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#b4b4b0',
  fontSize: 14,
  textAlign: 'center',
  lineHeight: 1.7,
};

const sectionHeaderStyle: React.CSSProperties = {
  cursor: 'pointer',
  fontWeight: 600,
  padding: '10px 0',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  color: '#1a1a1a',
  userSelect: 'none',
  borderBottom: '1px solid #f3f3f0',
};

const sectionBodyStyle: React.CSSProperties = {
  padding: '12px 0 12px 18px',
  fontSize: 13,
  lineHeight: 1.8,
  color: '#4b4b47',
};

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,
};

const panelTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#1a1a1a',
  letterSpacing: '-0.01em',
};

const exportBtnStyle: React.CSSProperties = {
  height: 28,
  padding: '0 12px',
  fontSize: 12,
  border: '1px solid transparent',
  borderRadius: 6,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  color: '#6b6b67',
  fontFamily: 'inherit',
  transition: 'background 0.15s',
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
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>◻</div>
          {skill?.description ?? '输出文档将在对话过程中逐步生成...'}
          <span style={{ fontSize: 12, marginTop: 8, opacity: 0.7 }}>
            AI 收集到足够信息后自动填充对应章节
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
      <div style={headerRowStyle}>
        <span style={panelTitleStyle}>输出文档</span>
        <button onClick={handleExport} style={exportBtnStyle}>
          导出 Markdown
        </button>
      </div>
      {state.output.sections.map((section) =>
        section.content ? (
          <div key={section.id}>
            <div style={sectionHeaderStyle} onClick={() => toggleSection(section.id)}>
              <span style={{ fontSize: 10, width: 14, color: '#b4b4b0' }}>
                {expanded.has(section.id) ? '▾' : '▸'}
              </span>
              {section.title}
              {section.mermaidDiagram && (
                <span style={{ fontSize: 10, color: '#2383e2', marginLeft: 4, fontWeight: 400 }}>
                  流程图
                </span>
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
