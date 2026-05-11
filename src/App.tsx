import React, { useEffect, useRef, useState } from 'react';
import { AppProvider, useAppState } from './context/AppContext';
import { getSkillById } from './data/skills';
import { saveSession } from './services/storage';
import { Header } from './components/Header/Header';
import { ChatPanel } from './components/ChatPanel/ChatPanel';
import { OutputPanel } from './components/OutputPanel/OutputPanel';
import { HistoryPanel } from './components/HistoryPanel/HistoryPanel';

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

    saveSession({
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

  return (
    <div
      key={state.sessionId}
      style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fbfbfa' }}
    >
      <AutoOpeningMessage />
      <AutoSaver />
      <Header onToggleHistory={() => setHistoryVisible((v) => !v)} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <HistoryPanel
          visible={historyVisible}
          onClose={() => setHistoryVisible(false)}
        />
        <ChatPanel />
        <OutputPanel />
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
