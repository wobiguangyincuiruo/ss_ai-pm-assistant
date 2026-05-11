import React from 'react';
import { useAppState } from '../../context/AppContext';
import { getSkillById } from '../../data/skills';
import { SkillSelector } from './SkillSelector';
import { ModeToggle } from './ModeToggle';
import { APIKeyInput } from './APIKeyInput';

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
  gap: 16,
};

const rightStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const modelInputStyle: React.CSSProperties = {
  width: 150,
  padding: '4px 8px',
  fontSize: 12,
  border: '1px solid #d9d9d9',
  borderRadius: 4,
  outline: 'none',
  fontFamily: 'monospace',
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
  const { state, dispatch } = useAppState();
  const skill = getSkillById(state.currentSkillId);

  const handleNewSession = () => {
    dispatch({ type: 'NEW_SESSION' });
  };

  return (
    <header style={headerStyle}>
      <div style={leftStyle}>
        <span style={titleStyle}>{skill?.name ?? '数字员工'}</span>
        <SkillSelector />
      </div>
      <div style={rightStyle}>
        <input
          style={modelInputStyle}
          placeholder="模型名"
          value={state.model}
          onChange={(e) => dispatch({ type: 'SET_MODEL', payload: e.target.value })}
          title="DeepSeek 模型 ID，如 deepseek-chat 或 deepseek-reasoner"
        />
        <ModeToggle />
        <APIKeyInput />
        <button style={newSessionBtnStyle} onClick={handleNewSession}>
          新会话
        </button>
      </div>
    </header>
  );
}
