import React from 'react';
import { useAppState } from '../../context/AppContext';
import { getSkillById } from '../../data/skills';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  borderRadius: 6,
  overflow: 'hidden',
  border: '1px solid #d9d9d9',
};

const btnBase: React.CSSProperties = {
  padding: '4px 14px',
  border: 'none',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 500,
  transition: 'all 0.2s',
};

export function ModeToggle() {
  const { state, dispatch } = useAppState();
  const skill = getSkillById(state.currentSkillId);
  const mockDisabled = !skill?.hasMock;

  const activeStyle: React.CSSProperties = {
    ...btnBase,
    backgroundColor: '#1677ff',
    color: '#fff',
  };

  const inactiveStyle: React.CSSProperties = {
    ...btnBase,
    backgroundColor: 'transparent',
    color: '#666',
  };

  const disabledStyle: React.CSSProperties = {
    ...btnBase,
    backgroundColor: 'transparent',
    color: '#bfbfbf',
    cursor: 'not-allowed',
    borderLeft: '1px solid #d9d9d9',
  };

  return (
    <div style={containerStyle}>
      <button
        style={state.mode === 'mock' && !mockDisabled ? activeStyle : inactiveStyle}
        disabled={mockDisabled}
        onClick={() => dispatch({ type: 'SET_MODE', payload: 'mock' })}
        title={mockDisabled ? '当前技能无演示数据' : undefined}
      >
        演示模式
      </button>
      <button
        style={{
          ...(state.mode === 'api' ? activeStyle : inactiveStyle),
          borderLeft: '1px solid #d9d9d9',
        }}
        onClick={() => dispatch({ type: 'SET_MODE', payload: 'api' })}
      >
        API模式
      </button>
    </div>
  );
}
