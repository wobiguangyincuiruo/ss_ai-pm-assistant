import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../../types';

const listStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: '20px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const bubbleBase: React.CSSProperties = {
  maxWidth: '75%',
  padding: '12px 16px',
  borderRadius: 12,
  fontSize: 14,
  lineHeight: 1.7,
  wordBreak: 'break-word',
};

const timeStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#999',
  marginTop: 4,
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
        <div style={{ color: '#bfbfbf', fontSize: 14, textAlign: 'center', maxWidth: 320 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
          在下方输入您的工作痛点，AI 助手将引导您完成需求分析
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
              backgroundColor: msg.role === 'user' ? '#1677ff' : '#fff',
              color: msg.role === 'user' ? '#fff' : '#333',
              borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 12,
              borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
              boxShadow: msg.role === 'assistant' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
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
