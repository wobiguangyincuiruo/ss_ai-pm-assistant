import React from 'react';
import { useAppState } from '../../context/AppContext';
import { StepProgressIndicator } from './StepProgressIndicator';
import { ModeToggle } from './ModeToggle';
import { APIKeyInput } from './APIKeyInput';
import { v4 as uuid } from 'uuid';

const headerStyle: React.CSSProperties = {
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  borderBottom: '1px solid #e8e8e8',
  backgroundColor: '#fff',
  flexShrink: 0,
};

const leftStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 32,
};

const rightStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const titleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: '#1a1a1a',
  whiteSpace: 'nowrap',
};

const newSessionBtnStyle: React.CSSProperties = {
  padding: '4px 14px',
  fontSize: 13,
  border: '1px solid #d9d9d9',
  borderRadius: 6,
  backgroundColor: '#fff',
  color: '#666',
  cursor: 'pointer',
};

export function Header() {
  const { dispatch } = useAppState();

  const handleNewSession = () => {
    dispatch({ type: 'NEW_SESSION' });
  };

  return (
    <header style={headerStyle}>
      <div style={leftStyle}>
        <span style={titleStyle}>AI 产品需求分析助手</span>
        <StepProgressIndicator />
      </div>
      <div style={rightStyle}>
        <ModeToggle />
        <APIKeyInput />
        <button style={newSessionBtnStyle} onClick={handleNewSession}>
          新会话
        </button>
      </div>
    </header>
  );
}
