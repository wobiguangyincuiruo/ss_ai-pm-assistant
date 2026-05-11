import React from 'react';
import { useAppState } from '../../context/AppContext';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { TypingIndicator } from './TypingIndicator';

const panelStyle: React.CSSProperties = {
  flex: 3,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minWidth: 0,
  backgroundColor: '#fbfbfa',
};

export function ChatPanel() {
  const { state } = useAppState();

  return (
    <div style={panelStyle}>
      <MessageList messages={state.messages} />
      {state.isTyping && <TypingIndicator />}
      <InputArea disabled={state.isTyping} />
    </div>
  );
}
