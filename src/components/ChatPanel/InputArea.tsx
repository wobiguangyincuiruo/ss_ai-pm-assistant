import React, { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useAppState } from '../../context/AppContext';
import { useChat } from '../../hooks/useChat';

const wrapperStyle: React.CSSProperties = {
  padding: '0 32px 20px',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'flex-end',
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: '8px 8px 8px 18px',
  border: '1px solid #e8e8ed',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const textareaStyle: React.CSSProperties = {
  flex: 1,
  padding: '6px 0',
  fontSize: 14,
  lineHeight: 1.6,
  border: 'none',
  outline: 'none',
  resize: 'none',
  minHeight: 24,
  maxHeight: 120,
  fontFamily: 'inherit',
  color: '#1a1a2e',
  backgroundColor: 'transparent',
};

const btnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  border: 'none',
  borderRadius: 20,
  backgroundColor: '#6366f1',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 16,
  flexShrink: 0,
  transition: 'opacity 0.15s',
};

const btnDisabledStyle: React.CSSProperties = {
  ...btnStyle,
  opacity: 0.3,
  cursor: 'not-allowed',
};

export function InputArea({ disabled }: { disabled: boolean }) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { state } = useAppState();
  const { sendMessage } = useChat();

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    sendMessage(trimmed, state.messages);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = !disabled && text.trim().length > 0;

  return (
    <div style={wrapperStyle}>
      <div style={rowStyle}>
        <textarea
          ref={textareaRef}
          style={textareaStyle}
          placeholder="输入消息...（Enter 发送，Shift+Enter 换行）"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />
        <button
          style={canSend ? btnStyle : btnDisabledStyle}
          disabled={!canSend}
          onClick={handleSend}
          title="发送"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
