import React, { useCallback, useRef } from 'react';

interface ResizeHandleProps {
  direction: 'horizontal';
  onResize: (delta: number) => void;
}

const handleStyle: React.CSSProperties = {
  width: 5,
  height: '100%',
  cursor: 'col-resize',
  backgroundColor: 'transparent',
  flexShrink: 0,
  position: 'relative',
  zIndex: 10,
  transition: 'background-color 0.15s',
};

export function ResizeHandle({ onResize }: ResizeHandleProps) {
  const draggingRef = useRef(false);
  const startXRef = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      draggingRef.current = true;
      startXRef.current = e.clientX;

      const onMouseMove = (ev: MouseEvent) => {
        if (!draggingRef.current) return;
        const delta = ev.clientX - startXRef.current;
        startXRef.current = ev.clientX;
        onResize(delta);
      };

      const onMouseUp = () => {
        draggingRef.current = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [onResize]
  );

  return (
    <div
      style={handleStyle}
      onMouseDown={onMouseDown}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.backgroundColor = '#e0dfe3';
      }}
      onMouseLeave={(e) => {
        if (!draggingRef.current) {
          (e.target as HTMLElement).style.backgroundColor = 'transparent';
        }
      }}
    />
  );
}
