import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { getSkillById } from '../../data/skills';
import { MermaidDiagram } from './MermaidDiagram';
import { exportToWord } from '../../services/docxExport';

function panelStyle(w: number): React.CSSProperties {
  return {
    width: w,
    flexShrink: 0,
    overflow: 'auto',
    padding: '24px 28px',
    borderLeft: '1px solid #e8e8ed',
    backgroundColor: '#ffffff',
  };
}

const emptyStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#80808b',
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
  color: '#1a1a2e',
  userSelect: 'none',
  borderBottom: '1px solid #e8e8ed',
};

const sectionBodyStyle: React.CSSProperties = {
  padding: '12px 0 12px 18px',
  fontSize: 13,
  lineHeight: 1.8,
  color: '#80808b',
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
  color: '#1a1a2e',
  letterSpacing: '-0.02em',
};

const exportBtnStyle: React.CSSProperties = {
  height: 30,
  padding: '0 14px',
  fontSize: 12,
  border: '1px solid #e8e8ed',
  borderRadius: 20,
  backgroundColor: '#fff',
  cursor: 'pointer',
  color: '#1a1a2e',
  fontWeight: 500,
  fontFamily: 'inherit',
  transition: 'background 0.15s, border-color 0.15s',
};

export function OutputPanel({ width }: { width: number }) {
  const { state } = useAppState();
  const skill = getSkillById(state.currentSkillId);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1, 2, 3]));
  const [exporting, setExporting] = useState(false);

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
      <div style={panelStyle(width)}>
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

  const handleExportMd = () => {
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

  const handleExportWord = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportToWord(filledSections, skillName);
    } catch (err) {
      console.error('Word 导出失败:', err);
      alert('导出 Word 失败，请重试。\n\n如持续失败请使用"导出 Markdown"备用。');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={panelStyle(width)}>
      <div style={headerRowStyle}>
        <span style={panelTitleStyle}>输出文档</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleExportMd} style={exportBtnStyle}>
            导出 Markdown
          </button>
          <button
            onClick={handleExportWord}
            style={{
              ...exportBtnStyle,
              backgroundColor: exporting ? '#e8e8ed' : '#1a1a2e',
              color: '#fff',
              border: '1px solid #1a1a2e',
              opacity: exporting ? 0.6 : 1,
              cursor: exporting ? 'not-allowed' : 'pointer',
            }}
            disabled={exporting}
          >
            {exporting ? '导出中...' : '导出 Word'}
          </button>
        </div>
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
                <span style={{ fontSize: 10, color: '#818cf8', marginLeft: 4, fontWeight: 400 }}>
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
