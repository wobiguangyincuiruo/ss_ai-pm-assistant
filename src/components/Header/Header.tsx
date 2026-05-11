import React from 'react';
import { useAppState } from '../../context/AppContext';
import { getSkillById } from '../../data/skills';
import { SkillSelector } from './SkillSelector';
import { ModeToggle } from './ModeToggle';
import { APIKeyInput } from './APIKeyInput';
import type { ApiProvider } from '../../types';

const headerStyle: React.CSSProperties = {
  height: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  backgroundColor: '#fff',
  flexShrink: 0,
  borderBottom: '1px solid #f0f0ec',
};

const leftStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const rightStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const pillBase: React.CSSProperties = {
  height: 28,
  padding: '0 10px',
  fontSize: 12,
  border: '1px solid transparent',
  borderRadius: 6,
  outline: 'none',
  backgroundColor: 'transparent',
  color: '#6b6b67',
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
};

const selectStyle: React.CSSProperties = {
  ...pillBase,
  appearance: 'auto' as React.CSSProperties['appearance'],
};

const modelInputStyle: React.CSSProperties = {
  ...pillBase,
  width: 140,
  fontFamily: 'inherit',
  cursor: 'text',
};

const urlInputStyle: React.CSSProperties = {
  ...pillBase,
  width: 170,
  fontFamily: 'inherit',
  cursor: 'text',
};

const titleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#1a1a1a',
  whiteSpace: 'nowrap',
  letterSpacing: '-0.01em',
};

const iconBtnStyle: React.CSSProperties = {
  ...pillBase,
  width: 28,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 15,
  borderRadius: 6,
};

const newSessionBtnStyle: React.CSSProperties = {
  ...pillBase,
};

const PROVIDER_OPTIONS: { value: ApiProvider; label: string }[] = [
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'custom', label: '自定义' },
];

interface HeaderProps {
  onToggleHistory: () => void;
}

export function Header({ onToggleHistory }: HeaderProps) {
  const { state, dispatch } = useAppState();
  const skill = getSkillById(state.currentSkillId);

  const handleNewSession = () => {
    dispatch({ type: 'NEW_SESSION' });
  };

  return (
    <header style={headerStyle}>
      <div style={leftStyle}>
        <button style={iconBtnStyle} onClick={onToggleHistory} title="历史记录">
          ☰
        </button>
        <span style={titleStyle}>{skill?.name ?? '数字员工'}</span>
        <SkillSelector />
      </div>
      <div style={rightStyle}>
        <select
          style={selectStyle}
          value={state.apiProvider}
          onChange={(e) =>
            dispatch({ type: 'SET_API_PROVIDER', payload: e.target.value as ApiProvider })
          }
          title="API 提供商"
        >
          {PROVIDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          style={modelInputStyle}
          placeholder={state.apiProvider === 'anthropic' ? 'claude-sonnet-4-20250514' : 'deepseek-chat'}
          value={state.model}
          onChange={(e) => dispatch({ type: 'SET_MODEL', payload: e.target.value })}
          title="模型 ID"
        />
        {state.apiProvider === 'custom' && (
          <input
            style={urlInputStyle}
            placeholder="https://api.example.com"
            value={state.apiBaseUrl}
            onChange={(e) => dispatch({ type: 'SET_API_BASE_URL', payload: e.target.value })}
            title="自定义 API 端点"
          />
        )}
        <ModeToggle />
        <APIKeyInput />
        <button style={newSessionBtnStyle} onClick={handleNewSession}>
          新会话
        </button>
      </div>
    </header>
  );
}
