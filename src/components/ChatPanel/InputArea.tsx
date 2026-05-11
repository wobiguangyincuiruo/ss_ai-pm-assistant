import React, { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useAppState } from '../../context/AppContext';
import { useChat } from '../../hooks/useChat';

const wrapperStyle: React.CSSProperties = {
  padding: '16px 24px',
  borderTop: '1px solid #e8e8e8',
  backgroundColor: '#fff',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'flex-end',
};

const textareaStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 14px',
  fontSize: 14,
  lineHeight: 1.6,
  border: '1px solid #d9d9d9',
  borderRadius: 8,
  outline: 'none',
  resize: 'none',
  minHeight: 44,
  maxHeight: 120,
  fontFamily: 'inherit',
};

const btnStyle: React.CSSProperties = {
  padding: '10px 24px',
  fontSize: 14,
  fontWeight: 600,
  border: 'none',
  borderRadius: 8,
  backgroundColor: '#1677ff',
  color: '#fff',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'background-color 0.2s',
};

const btnDisabledStyle: React.CSSProperties = {
  ...btnStyle,
  backgroundColor: '#d9d9d9',
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

  return (
    <div style={wrapperStyle}>
      <div style={rowStyle}>
        <textarea
          ref={textareaRef}
          style={textareaStyle}
          placeholder="输入您的回答...（Enter 发送，Shift+Enter 换行）"
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
          style={disabled || !text.trim() ? btnDisabledStyle : btnStyle}
          disabled={disabled || !text.trim()}
          onClick={handleSend}
        >
          发送
        </button>
      </div>
    </div>
  );
}
