import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'default' });

export function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    if (!chart) return;
    let cancelled = false;
    mermaid
      .render(idRef.current, chart)
      .then(({ svg: result }) => {
        if (!cancelled) setSvg(result);
      })
      .catch(() => {
        if (!cancelled)
          setSvg(
            '<p style="color:#b4b4b0;font-size:12px;">流程图渲染失败，请检查 Mermaid 语法</p>'
          );
      });
    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <div
      ref={containerRef}
      style={{
        margin: '8px 0',
        overflow: 'auto',
        borderRadius: 8,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
