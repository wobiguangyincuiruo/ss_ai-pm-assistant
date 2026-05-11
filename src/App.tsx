import React, { useEffect, useRef } from 'react';
import { AppProvider, useAppState } from './context/AppContext';
import { Header } from './components/Header/Header';
import { ChatPanel } from './components/ChatPanel/ChatPanel';
import { PRDPanel } from './components/PRDPanel/PRDPanel';
import { useChat } from './hooks/useChat';

function AutoOpeningMessage() {
  const { state, dispatch } = useAppState();
  const { sendMessage } = useChat();
  const hasSent = useRef(false);

  useEffect(() => {
    if (hasSent.current) return;
    hasSent.current = true;

    const openingMsg =
      '您好！我是需求分析助手。请您用一段话描述您日常工作中**最耗时**或**最头疼**的一个任务。不用考虑技术，只告诉我您现在是怎么做的，大概需要几步，涉及哪些人和系统。';

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
      dispatch({ type: 'SET_CURRENT_STEP', payload: 1 });
    }, 500);

    return () => clearTimeout(timer);
    // Only run once per mount / NEW_SESSION
  }, [state.sessionId, dispatch]);

  return null;
}

function AppContent() {
  const { state } = useAppState();
  // Key by sessionId so inner components remount on new session
  const sessionKey = state.sessionId;

  return (
    <div key={sessionKey} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AutoOpeningMessage />
      <Header />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <ChatPanel />
        <PRDPanel />
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
