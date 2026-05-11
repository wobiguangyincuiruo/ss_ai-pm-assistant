import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';

const inputStyle: React.CSSProperties = {
  height: 28,
  width: 150,
  padding: '0 10px',
  fontSize: 12,
  border: '1px solid transparent',
  borderRadius: 6,
  outline: 'none',
  backgroundColor: 'transparent',
  color: '#1a1a1a',
  fontFamily: 'inherit',
  transition: 'background 0.15s',
};

const placeholder = '输入 API Key';

export function APIKeyInput() {
  const { state, dispatch } = useAppState();
  const [visible, setVisible] = useState(false);

  if (state.mode !== 'api') return null;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        type={visible ? 'text' : 'password'}
        style={inputStyle}
        placeholder={placeholder}
        value={state.apiKey}
        onChange={(e) => dispatch({ type: 'SET_API_KEY', payload: e.target.value })}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      />
      {!state.apiKey && (
        <span style={{ fontSize: 10, color: '#ff4d4f', position: 'absolute', top: -14, left: 4, whiteSpace: 'nowrap' }}>
          请填写 API Key
        </span>
      )}
    </div>
  );
}
