import React from 'react';
import { useAppState } from '../../context/AppContext';
import { useSessions } from '../../hooks/useSessions';
import { loadSession } from '../../services/storage';
import type { SessionMeta } from '../../types';

interface HistoryPanelProps {
  visible: boolean;
  onClose: () => void;
}

const panelStyle: React.CSSProperties = {
  width: 280,
  height: '100%',
  borderRight: '1px solid #f0f0ec',
  backgroundColor: '#fff',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 16px 12px',
};

const headerTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#1a1a1a',
};

const closeBtnStyle: React.CSSProperties = {
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontSize: 16,
  color: '#b4b4b0',
  padding: '0 4px',
  lineHeight: 1,
  borderRadius: 4,
};

const listStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '0 12px 12px',
};

const cardBase: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  marginBottom: 4,
  cursor: 'pointer',
  position: 'relative',
  transition: 'background 0.15s',
};

const cardActive: React.CSSProperties = {
  ...cardBase,
  backgroundColor: '#f3f3f0',
};

const cardInactive: React.CSSProperties = {
  ...cardBase,
  backgroundColor: 'transparent',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: '#1a1a1a',
  marginBottom: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  paddingRight: 40,
};

const cardMetaStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#b4b4b0',
  marginBottom: 1,
};

const cardPreviewStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#c8c8c4',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  marginTop: 4,
};

const actionBtnBase: React.CSSProperties = {
  position: 'absolute',
  top: 8,
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontSize: 13,
  color: '#b4b4b0',
  padding: '2px 4px',
  lineHeight: 1,
  borderRadius: 4,
  transition: 'color 0.15s',
};

const renameBtnStyle: React.CSSProperties = {
  ...actionBtnBase,
  right: 24,
};

const deleteBtnStyle: React.CSSProperties = {
  ...actionBtnBase,
  right: 6,
  fontSize: 14,
};

const emptyStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#b4b4b0',
  fontSize: 13,
  textAlign: 'center',
  padding: 24,
  lineHeight: 1.7,
};

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return new Date(ts).toLocaleDateString('zh-CN');
}

function SessionCard({
  meta,
  active,
  onClick,
  onRename,
  onDelete,
}: {
  meta: SessionMeta;
  active: boolean;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div style={active ? cardActive : cardInactive} onClick={onClick}>
      <div style={cardTitleStyle}>{meta.title}</div>
      <div style={cardMetaStyle}>
        {meta.skillName} · {meta.messageCount}条消息
      </div>
      <div style={cardMetaStyle}>{formatTime(meta.updatedAt)}</div>
      {meta.preview && <div style={cardPreviewStyle}>{meta.preview}</div>}
      <button
        style={renameBtnStyle}
        title="重命名"
        onClick={(e) => {
          e.stopPropagation();
          onRename();
        }}
      >
        ✎
      </button>
      <button
        style={deleteBtnStyle}
        title="删除"
        onClick={(e) => {
          e.stopPropagation();
          if (confirm('确定删除这条历史记录？')) {
            onDelete();
          }
        }}
      >
        ×
      </button>
    </div>
  );
}

export function HistoryPanel({ visible, onClose }: HistoryPanelProps) {
  const { state, dispatch } = useAppState();
  const { sessions, loading, remove, rename } = useSessions();

  if (!visible) return null;

  const handleLoad = (meta: SessionMeta) => {
    const data = loadSession(meta.id);
    if (data) {
      dispatch({ type: 'LOAD_SESSION', payload: data });
      onClose();
    }
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <span style={headerTitleStyle}>历史记录</span>
        <button style={closeBtnStyle} onClick={onClose}>
          ×
        </button>
      </div>
      <div style={listStyle}>
        {loading ? (
          <div style={emptyStyle}>加载中...</div>
        ) : sessions.length === 0 ? (
          <div style={emptyStyle}>
            <div>暂无历史记录</div>
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
              发送第一条消息后会自动保存
            </div>
          </div>
        ) : (
          sessions
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((meta) => (
              <SessionCard
                key={meta.id}
                meta={meta}
                active={meta.id === state.sessionId}
                onClick={() => handleLoad(meta)}
                onRename={() => {
                  const newTitle = prompt('重命名', meta.title);
                  if (newTitle && newTitle.trim()) {
                    rename(meta.id, newTitle.trim());
                  }
                }}
                onDelete={() => remove(meta.id)}
              />
            ))
        )}
      </div>
    </div>
  );
}
