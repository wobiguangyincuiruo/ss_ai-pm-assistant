import React from 'react';
import { useAppState } from '../../context/AppContext';
import { getSkillById } from '../../data/skills';
import { SkillSelector } from './SkillSelector';
import { ModeToggle } from './ModeToggle';
import { APIKeyInput } from './APIKeyInput';
import type { ApiProvider } from '../../types';

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

const selectStyle: React.CSSProperties = {
  padding: '4px 6px',
  fontSize: 12,
  border: '1px solid #d9d9d9',
  borderRadius: 4,
  outline: 'none',
  backgroundColor: '#fff',
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

const urlInputStyle: React.CSSProperties = {
  width: 180,
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

const historyBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: 16,
  border: '1px solid #d9d9d9',
  borderRadius: 6,
  backgroundColor: '#fff',
  color: '#666',
  cursor: 'pointer',
  lineHeight: 1,
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
        <button style={historyBtnStyle} onClick={onToggleHistory} title="历史记录">
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
            title="自定义 API 端点地址"
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
