import React from 'react';

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 24px',
  fontSize: 13,
  color: '#999',
};

const dotStyle: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  backgroundColor: '#bfbfbf',
  animation: 'typingBounce 1.4s infinite ease-in-out both',
};

// Inject keyframes once
const styleId = 'typing-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const sheet = document.createElement('style');
  sheet.id = styleId;
  sheet.textContent = `
    @keyframes typingBounce {
      0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(sheet);
}

const DOTS = [
  { ...dotStyle, animationDelay: '0s' },
  { ...dotStyle, animationDelay: '0.2s' },
  { ...dotStyle, animationDelay: '0.4s' },
];

export function TypingIndicator() {
  return (
    <div style={wrapperStyle}>
      <span>AI 正在分析</span>
      {DOTS.map((s, i) => (
        <span key={i} style={s} />
      ))}
    </div>
  );
}
