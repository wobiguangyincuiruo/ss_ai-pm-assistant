import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AppProvider, useAppState } from './context/AppContext';
import { getSkillById } from './data/skills';
import { saveSession, saveSessionToServer } from './services/storage';
import { Header } from './components/Header/Header';
import { ChatPanel } from './components/ChatPanel/ChatPanel';
import { OutputPanel } from './components/OutputPanel/OutputPanel';
import { HistoryPanel } from './components/HistoryPanel/HistoryPanel';
import { ResizeHandle } from './components/ResizeHandle';

function buildPrdMarkdown(
  sections: { title: string; content: string; mermaidDiagram?: string }[],
  skillName: string
): string {
  const filled = sections.filter((s) => s.content.length > 0);
  if (filled.length === 0) return '';
  const now = new Date().toLocaleString('zh-CN');
  let md = `# ${skillName}\n\n> 自动生成于 ${now}\n\n`;
  md += filled
    .map((s) => {
      let block = `## ${s.title}\n\n${s.content}`;
      if (s.mermaidDiagram) {
        block += `\n\n\`\`\`mermaid\n${s.mermaidDiagram}\n\`\`\``;
      }
      return block;
    })
    .join('\n\n---\n\n');
  return md;
}

function PrdAutoSaver() {
  const { state } = useAppState();
  const lastHashRef = useRef('');

  useEffect(() => {
    const skill = getSkillById(state.currentSkillId);
    const md = buildPrdMarkdown(state.output.sections, skill?.name ?? '数字员工');
    if (!md) return;

    const hash = md.slice(0, 200);
    if (hash === lastHashRef.current) return;
    lastHashRef.current = hash;

    const title = state.messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)[0]
      ?.slice(0, 40) || '未命名';

    const label = skill?.outputLabel ?? '文档';
    const date = new Date().toISOString().slice(0, 10);
    const filename = `${label}_${title}_${date}.md`;

    fetch('/api/save-prd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content: md }),
    }).then((res) => {
      if (res.ok) console.log(`[PrdAutoSaver] 已保存到 prds/${filename}`);
    }).catch((err) => {
      console.error('[PrdAutoSaver] 保存失败:', err);
    });
  }, [state.output, state.currentSkillId, state.messages]);

  return null;
}

function AutoOpeningMessage() {
  const { state, dispatch } = useAppState();
  const firedFor = useRef<string | null>(null);

  useEffect(() => {
    if (firedFor.current === state.sessionId) return;
    if (state.messages.length > 0) return;
    firedFor.current = state.sessionId;

    const skill = getSkillById(state.currentSkillId);
    const openingMsg =
      skill?.openingMessage ??
      '您好！请描述您需要处理的任务，我会协助您完成。';

    const timer = setTimeout(() => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: 'opening',
          role: 'assistant',
          content: openingMsg,
          timestamp: Date.now(),
        },
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [state.sessionId, state.currentSkillId, state.messages.length, dispatch]);

  return null;
}

function AutoSaver() {
  const { state } = useAppState();
  const prevLenRef = useRef(state.messages.length);
  const saveCountRef = useRef(0);

  useEffect(() => {
    const len = state.messages.length;
    if (len <= prevLenRef.current || len <= 1) {
      prevLenRef.current = len;
      return;
    }
    prevLenRef.current = len;

    const skill = getSkillById(state.currentSkillId);
    const userMsgs = state.messages.filter((m) => m.role === 'user');
    const firstUserMsg = userMsgs.length > 0 ? userMsgs[0].content : '';

    const sessionData = {
      meta: {
        id: state.sessionId,
        title: firstUserMsg.slice(0, 50) || '空会话',
        skillId: state.currentSkillId,
        skillName: skill?.name ?? '数字员工',
        messageCount: len,
        preview: firstUserMsg.slice(0, 80),
        createdAt: state.messages[0]?.timestamp ?? Date.now(),
        updatedAt: Date.now(),
      },
      messages: state.messages,
      output: state.output,
      apiProvider: state.apiProvider,
      model: state.model,
      apiBaseUrl: state.apiBaseUrl,
    };

    try {
      saveSession(sessionData);
      saveCountRef.current += 1;
      console.log(`[AutoSave] 已保存会话 #${saveCountRef.current}: ${sessionData.meta.title} (${len} 条消息)`);
    } catch (err) {
      console.error('[AutoSave] localStorage 保存失败:', err);
    }

    saveSessionToServer(sessionData).catch((err) => {
      console.error('[AutoSave] 服务端保存失败:', err);
    });
  }, [
    state.messages,
    state.output,
    state.sessionId,
    state.currentSkillId,
    state.apiProvider,
    state.model,
    state.apiBaseUrl,
  ]);

  return null;
}

function AppContent() {
  const { state } = useAppState();
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyWidth, setHistoryWidth] = useState(280);
  const [outputWidth, setOutputWidth] = useState(380);

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const onHistoryResize = useCallback((delta: number) => {
    setHistoryWidth((w) => clamp(w + delta, 200, 500));
  }, []);

  const onOutputResize = useCallback((delta: number) => {
    setOutputWidth((w) => clamp(w - delta, 250, 800));
  }, []);

  return (
    <div
      style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f7' }}
    >
      <AutoOpeningMessage />
      <AutoSaver />
      <PrdAutoSaver />
      <Header onToggleHistory={() => setHistoryVisible((v) => !v)} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <HistoryPanel
          visible={historyVisible}
          onClose={() => setHistoryVisible(false)}
          width={historyWidth}
        />
        {historyVisible && <ResizeHandle direction="horizontal" onResize={onHistoryResize} />}
        <ChatPanel />
        <ResizeHandle direction="horizontal" onResize={onOutputResize} />
        <OutputPanel width={outputWidth} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
