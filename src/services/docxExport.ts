import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType } from 'docx';
import type { OutputSection } from '../types';

function svgToPngBuffer(svg: string): Promise<{ buffer: Uint8Array; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG→PNG timeout'));
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
        blob.arrayBuffer().then((buf) =>
          resolve({ buffer: new Uint8Array(buf), width: img.naturalWidth, height: img.naturalHeight })
        ).catch(reject);
      }, 'image/png');
    };

    img.onerror = (e) => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      console.error('SVG image load failed', e);
      reject(new Error('SVG load failed'));
    };
    img.src = url;
  });
}

async function renderMermaidImage(diagram: string): Promise<ImageRun | null> {
  try {
    const mermaid = (await import('mermaid')).default;
    const id = `dm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const { svg } = await mermaid.render(id, diagram);
    const { buffer, width, height } = await svgToPngBuffer(svg);

    const maxWidth = 580;
    const s = Math.min(1, maxWidth / width);

    return new ImageRun({
      data: buffer,
      transformation: { width: Math.round(width * s), height: Math.round(height * s) },
      type: 'png',
    });
  } catch (err) {
    console.error('Mermaid render failed:', err);
    return null;
  }
}

interface InlineToken {
  type: 'text' | 'bold';
  text: string;
}

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', text: text.slice(lastIndex, match.index) });
    }
    tokens.push({ type: 'bold', text: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', text: text.slice(lastIndex) });
  }

  return tokens.length > 0 ? tokens : [{ type: 'text', text }];
}

function runsFromText(text: string): TextRun[] {
  return parseInline(text).map((t) =>
    new TextRun({ text: t.text, bold: t.type === 'bold' })
  );
}

function parseMarkdownContent(md: string): Paragraph[] {
  const result: Paragraph[] = [];
  const lines = md.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') { i++; continue; }

    // Heading 2
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      result.push(new Paragraph({
        children: runsFromText(h2[1]),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 360, after: 200 },
      }));
      i++; continue;
    }

    // Heading 3
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      result.push(new Paragraph({
        children: runsFromText(h3[1]),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 280, after: 160 },
      }));
      i++; continue;
    }

    // Code block
    if (line.trim().startsWith('```')) {
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      if (codeLines.length > 0) {
        result.push(new Paragraph({
          children: [new TextRun({ text: codeLines.join('\n'), font: 'Courier New', size: 18 })],
          spacing: { before: 120, after: 120 },
        }));
      }
      continue;
    }

    // Bullet list
    const bullet = line.match(/^[-*]\s+(.+)/);
    if (bullet) {
      while (i < lines.length) {
        const bm = lines[i].match(/^[-*]\s+(.+)/);
        if (!bm) break;
        result.push(new Paragraph({
          children: runsFromText(bm[1]),
          bullet: { level: 0 },
          spacing: { after: 60, line: 276 },
        }));
        i++;
      }
      continue;
    }

    // Ordered list
    const ordered = line.match(/^\d+\.\s+(.+)/);
    if (ordered) {
      let counter = 1;
      while (i < lines.length) {
        const om = lines[i].match(/^\d+\.\s+(.+)/);
        if (!om) break;
        result.push(new Paragraph({
          children: runsFromText(`${counter}. ${om[1]}`),
          spacing: { after: 60, line: 276 },
        }));
        counter++;
        i++;
      }
      continue;
    }

    // Regular paragraph
    result.push(new Paragraph({
      children: runsFromText(line),
      spacing: { after: 120, line: 276 },
    }));
    i++;
  }

  return result;
}

export async function exportToWord(
  sections: OutputSection[],
  skillName: string
): Promise<void> {
  const children: Paragraph[] = [];

  // Document title
  children.push(new Paragraph({
    children: [new TextRun({ text: skillName, bold: true, size: 36, font: 'Microsoft YaHei' })],
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 160 },
  }));

  // Date
  children.push(new Paragraph({
    children: [new TextRun({
      text: `生成日期：${new Date().toLocaleDateString('zh-CN')}`,
      size: 20,
      color: '999999',
      font: 'Microsoft YaHei',
    })],
    spacing: { after: 400 },
  }));

  for (const section of sections) {
    if (!section.content) continue;

    children.push(new Paragraph({
      children: [new TextRun({ text: section.title, bold: true, size: 28, font: 'Microsoft YaHei' })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 360, after: 200 },
    }));

    // Parse markdown content
    for (const p of parseMarkdownContent(section.content)) {
      children.push(p);
    }

    // Mermaid diagram → PNG embed
    if (section.mermaidDiagram) {
      children.push(new Paragraph({
        children: [new TextRun({ text: '（流程图）', size: 18, italics: true, color: '999999', font: 'Microsoft YaHei' })],
        spacing: { before: 280, after: 120 },
      }));

      const imageRun = await renderMermaidImage(section.mermaidDiagram);
      if (imageRun) {
        children.push(new Paragraph({
          children: [imageRun],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }));
      } else {
        children.push(new Paragraph({
          children: [new TextRun({ text: '[流程图渲染失败，请查看 Markdown 导出]', size: 18, color: 'CC0000', font: 'Microsoft YaHei' })],
          spacing: { after: 120 },
        }));
      }
    }

    children.push(new Paragraph({ spacing: { after: 160 } }));
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Microsoft YaHei', size: 21 },
        },
      },
    },
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${skillName}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
