import React from 'react';
import { useAppState } from '../../context/AppContext';
import { getSkillById } from '../../data/skills';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  borderRadius: 8,
  overflow: 'hidden',
  border: '1px solid #e8e8ed',
  backgroundColor: '#f5f5f7',
  height: 32,
};

const btnBase: React.CSSProperties = {
  height: 32,
  padding: '0 14px',
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
  color: '#80808b',
  backgroundColor: 'transparent',
  borderRadius: 8,
  transition: 'all 0.15s',
  fontFamily: 'inherit',
};

export function ModeToggle() {
  const { state, dispatch } = useAppState();
  const skill = getSkillById(state.currentSkillId);
  const mockDisabled = !skill?.hasMock;

  const activeStyle: React.CSSProperties = {
    ...btnBase,
    backgroundColor: '#fff',
    color: '#1a1a2e',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  };

  const inactiveStyle: React.CSSProperties = {
    ...btnBase,
    backgroundColor: 'transparent',
  };

  const disabledStyle: React.CSSProperties = {
    ...btnBase,
    color: '#bfbfbc',
    cursor: 'not-allowed',
  };

  return (
    <div style={containerStyle}>
      <button
        style={state.mode === 'mock' && !mockDisabled ? activeStyle : mockDisabled ? disabledStyle : inactiveStyle}
        disabled={mockDisabled}
        onClick={() => dispatch({ type: 'SET_MODE', payload: 'mock' })}
        title={mockDisabled ? '当前技能无演示数据' : undefined}
      >
        演示
      </button>
      <button
        style={state.mode === 'api' ? activeStyle : inactiveStyle}
        onClick={() => dispatch({ type: 'SET_MODE', payload: 'api' })}
      >
        API
      </button>
    </div>
  );
}
