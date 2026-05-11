import React from 'react';
import { useAppState } from '../../context/AppContext';

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

  return (
    <div style={containerStyle}>
      <button
        style={state.mode === 'mock' ? activeStyle : inactiveStyle}
        onClick={() => dispatch({ type: 'SET_MODE', payload: 'mock' })}
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
