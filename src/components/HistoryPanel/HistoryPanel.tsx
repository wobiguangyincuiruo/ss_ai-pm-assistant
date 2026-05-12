import React from 'react';
import { useAppState } from '../../context/AppContext';
import { useSessions } from '../../hooks/useSessions';
import { loadSession, loadSessionFromServer } from '../../services/storage';
import type { SessionMeta } from '../../types';

interface HistoryPanelProps {
  visible: boolean;
  onClose: () => void;
  width: number;
}

// —— Dark sidebar palette ——
const SIDEBAR_BG = '#1a1b2e';
const CARD_BG = '#232440';
const CARD_ACTIVE_BG = '#2d2f52';
const CARD_HOVER_BG = '#282a45';
const TEXT_PRIMARY = '#e4e4ed';
const TEXT_SECONDARY = '#8b8c9e';
const TEXT_MUTED = '#63647a';
const BORDER_COLOR = '#2e2f45';
const ACCENT = '#7c7ef0';
const ACCENT_BORDER = '#5b5dcc';

function panelStyle(w: number): React.CSSProperties {
  return {
    width: w,
    height: '100%',
    backgroundColor: SIDEBAR_BG,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden',
  };
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 18px 14px',
};

const headerTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: TEXT_PRIMARY,
  letterSpacing: '0.01em',
};

const closeBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  border: 'none',
  backgroundColor: 'transparent',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 16,
  color: TEXT_SECONDARY,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.15s, color 0.15s',
};

const searchBoxStyle: React.CSSProperties = {
  margin: '0 16px 12px',
  padding: '8px 12px',
  borderRadius: 8,
  border: `1px solid ${BORDER_COLOR}`,
  backgroundColor: CARD_BG,
  color: TEXT_PRIMARY,
  fontSize: 12,
  outline: 'none',
  fontFamily: 'inherit',
};

const listStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '0 10px 12px',
};

const cardBase: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: 10,
  marginBottom: 3,
  cursor: 'pointer',
  position: 'relative',
  transition: 'background 0.12s',
  border: '1px solid transparent',
};

const cardActive: React.CSSProperties = {
  ...cardBase,
  backgroundColor: CARD_ACTIVE_BG,
  border: `1px solid ${ACCENT_BORDER}`,
};

const cardInactive: React.CSSProperties = {
  ...cardBase,
  backgroundColor: 'transparent',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: TEXT_PRIMARY,
  marginBottom: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  paddingRight: 44,
  lineHeight: 1.4,
};

const cardMetaStyle: React.CSSProperties = {
  fontSize: 11,
  color: TEXT_MUTED,
  marginBottom: 1,
};

const cardPreviewStyle: React.CSSProperties = {
  fontSize: 11,
  color: TEXT_SECONDARY,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  marginTop: 5,
  lineHeight: 1.4,
};

const actionBtnBase: React.CSSProperties = {
  position: 'absolute',
  top: 10,
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontSize: 12,
  color: TEXT_MUTED,
  padding: 0,
  width: 20,
  height: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 5,
  transition: 'color 0.15s, background 0.15s',
};

const renameBtnStyle: React.CSSProperties = {
  ...actionBtnBase,
  right: 26,
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
  color: TEXT_MUTED,
  fontSize: 13,
  textAlign: 'center',
  padding: 24,
  lineHeight: 1.7,
};

const badgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 7px',
  borderRadius: 10,
  backgroundColor: ACCENT,
  color: '#fff',
  fontSize: 10,
  fontWeight: 600,
  marginLeft: 4,
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
    <div
      style={active ? cardActive : cardInactive}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = CARD_HOVER_BG;
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
    >
      <div style={cardTitleStyle}>{meta.title}</div>
      <div style={cardMetaStyle}>
        {meta.skillName}
        <span style={badgeStyle}>{meta.messageCount}</span>
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
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = TEXT_PRIMARY; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = TEXT_MUTED; }}
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
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = TEXT_MUTED; }}
      >
        ×
      </button>
    </div>
  );
}

export function HistoryPanel({ visible, onClose, width }: HistoryPanelProps) {
  const { state, dispatch } = useAppState();
  const { sessions, loading, remove, rename } = useSessions();
  const [search, setSearch] = React.useState('');

  if (!visible) return null;

  const handleLoad = async (meta: SessionMeta) => {
    let data = loadSession(meta.id);
    if (!data) {
      data = await loadSessionFromServer(meta.id);
    }
    if (data) {
      dispatch({ type: 'LOAD_SESSION', payload: data });
      onClose();
    }
  };

  const filtered = search.trim()
    ? sessions.filter((s) => s.title.includes(search.trim()) || s.skillName.includes(search.trim()))
    : sessions;

  return (
    <div style={panelStyle(width)}>
      <div style={headerStyle}>
        <span style={headerTitleStyle}>会话历史</span>
        <button
          style={closeBtnStyle}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = CARD_HOVER_BG;
            e.currentTarget.style.color = TEXT_PRIMARY;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = TEXT_SECONDARY;
          }}
        >
          ✕
        </button>
      </div>
      {sessions.length > 0 && (
        <input
          style={searchBoxStyle}
          placeholder="搜索会话…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}
      <div style={listStyle}>
        {loading ? (
          <div style={emptyStyle}>加载中...</div>
        ) : filtered.length === 0 ? (
          <div style={emptyStyle}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.5 }}>☰</div>
            {search ? (
              <div>未找到匹配的会话</div>
            ) : (
              <>
                <div>暂无会话记录</div>
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                  发送第一条消息后自动保存
                </div>
              </>
            )}
          </div>
        ) : (
          filtered
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
