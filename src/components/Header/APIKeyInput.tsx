import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';

const inputStyle: React.CSSProperties = {
  width: 160,
  padding: '4px 8px',
  fontSize: 12,
  border: '1px solid #d9d9d9',
  borderRadius: 4,
  outline: 'none',
};

export function APIKeyInput() {
  const { state, dispatch } = useAppState();
  const [visible, setVisible] = useState(false);

  if (state.mode !== 'api') return null;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
      <input
        type={visible ? 'text' : 'password'}
        style={inputStyle}
        placeholder="输入 Anthropic API Key"
        value={state.apiKey}
        onChange={(e) => dispatch({ type: 'SET_API_KEY', payload: e.target.value })}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      />
      {!state.apiKey && (
        <span style={{ fontSize: 10, color: '#ff4d4f', position: 'absolute', top: -14, left: 4 }}>
          请填写 API Key
        </span>
      )}
    </div>
  );
}
