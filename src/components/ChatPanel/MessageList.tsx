import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../../types';

const listStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: '24px 32px',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
};

const bubbleBase: React.CSSProperties = {
  maxWidth: '72%',
  padding: '10px 16px',
  borderRadius: 10,
  fontSize: 14,
  lineHeight: 1.65,
  wordBreak: 'break-word',
};

const timeStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#b4b4b0',
  marginTop: 3,
  padding: '0 4px',
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export function MessageList({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div style={{ ...listStyle, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#b4b4b0', fontSize: 14, textAlign: 'center', maxWidth: 340 }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.6 }}>✦</div>
          在下方描述您的需求，AI 助手将引导您逐步完成
        </div>
      </div>
    );
  }

  return (
    <div style={listStyle}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}
        >
          <div
            style={{
              ...bubbleBase,
              backgroundColor: msg.role === 'user' ? '#2383e2' : '#f3f3f0',
              color: msg.role === 'user' ? '#fff' : '#1a1a1a',
              borderBottomRightRadius: msg.role === 'user' ? 4 : 10,
              borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 10,
            }}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
          <div style={timeStyle}>{formatTime(msg.timestamp)}</div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
