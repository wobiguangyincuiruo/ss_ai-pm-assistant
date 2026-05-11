import React, { useEffect, useRef } from 'react';
import { AppProvider, useAppState } from './context/AppContext';
import { getSkillById } from './data/skills';
import { Header } from './components/Header/Header';
import { ChatPanel } from './components/ChatPanel/ChatPanel';
import { OutputPanel } from './components/OutputPanel/OutputPanel';

function AutoOpeningMessage() {
  const { state, dispatch } = useAppState();
  const hasSent = useRef(false);

  useEffect(() => {
    if (hasSent.current) return;
    hasSent.current = true;

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
  }, [state.sessionId, state.currentSkillId, dispatch]);

  return null;
}

function AppContent() {
  const { state } = useAppState();
  const sessionKey = state.sessionId;

  return (
    <div key={sessionKey} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AutoOpeningMessage />
      <Header />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
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
