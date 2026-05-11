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
        <ModeToggle />
        <APIKeyInput />
        <button style={newSessionBtnStyle} onClick={handleNewSession}>
          新会话
        </button>
      </div>
    </header>
  );
}
