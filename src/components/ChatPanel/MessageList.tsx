import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../../types';

const listStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: '24px 32px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const bubbleBase: React.CSSProperties = {
  maxWidth: '72%',
  padding: '12px 18px',
  borderRadius: 16,
  fontSize: 14,
  lineHeight: 1.65,
  wordBreak: 'break-word',
};

const timeStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#a0a0ab',
  marginTop: 4,
  padding: '0 6px',
};

const dateSepStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  padding: '8px 0',
};

const dateSepLine: React.CSSProperties = {
  flex: 1,
  height: 1,
  backgroundColor: '#e2e2e8',
  maxWidth: 80,
};

const dateSepText: React.CSSProperties = {
  fontSize: 12,
  color: '#90909b',
  fontWeight: 500,
  whiteSpace: 'nowrap',
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  const weekDay = d.toLocaleDateString('zh-CN', { weekday: 'short' });

  if (d.toDateString() === today.toDateString()) return `今天 ${weekDay}`;
  if (d.toDateString() === yesterday.toDateString()) return `昨天 ${weekDay}`;
  return `${dateStr} ${weekDay}`;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MessageList({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div style={{ ...listStyle, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#a0a0ab', fontSize: 14, textAlign: 'center', maxWidth: 340 }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>✦</div>
          在下方描述您的需求，AI 助手将引导您逐步完成
        </div>
      </div>
    );
  }

  const elements: React.ReactNode[] = [];
  let lastDate = '';

  messages.forEach((msg) => {
    const dateLabel = formatDate(msg.timestamp);
    if (dateLabel !== lastDate) {
      lastDate = dateLabel;
      elements.push(
        <div key={`date-${msg.id}`} style={dateSepStyle}>
          <div style={dateSepLine} />
          <span style={dateSepText}>{dateLabel}</span>
          <div style={dateSepLine} />
        </div>
      );
    }

    elements.push(
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
            backgroundColor: msg.role === 'user' ? '#6366f1' : '#f3f3f5',
            color: msg.role === 'user' ? '#fff' : '#1a1a2e',
            borderBottomRightRadius: msg.role === 'user' ? 6 : 16,
            borderBottomLeftRadius: msg.role === 'assistant' ? 6 : 16,
            boxShadow: msg.role === 'user' ? '0 1px 3px rgba(99,102,241,0.25)' : '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
        <div style={timeStyle}>{formatTime(msg.timestamp)}</div>
      </div>
    );
  });

  return (
    <div style={listStyle}>
      {elements}
      <div ref={bottomRef} />
    </div>
  );
}
