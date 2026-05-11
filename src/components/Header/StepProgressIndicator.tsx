import React from 'react';
import { useAppState } from '../../context/AppContext';
import type { StepNumber } from '../../types';

const STEP_LABELS: Record<StepNumber, { label: string; desc: string }> = {
  1: { label: '建立上下文', desc: '了解业务痛点' },
  2: { label: '还原流程', desc: '梳理当前步骤' },
  3: { label: '识别AI机会', desc: '发现可替代环节' },
  4: { label: '共识与PRD', desc: '确认需求并输出' },
};

const steps: StepNumber[] = [1, 2, 3, 4];

export function StepProgressIndicator() {
  const { state } = useAppState();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {steps.map((step, i) => {
        const isActive = state.currentStep === step;
        const isDone = state.currentStep > step;

        return (
          <React.Fragment key={step}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 16,
                backgroundColor: isActive ? '#1677ff' : isDone ? '#e6f4ff' : '#f5f5f5',
                color: isActive ? '#fff' : isDone ? '#1677ff' : '#bfbfbf',
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.3s',
                whiteSpace: 'nowrap',
              }}
              title={STEP_LABELS[step].desc}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : isDone ? '#1677ff' : '#d9d9d9',
                  color: isActive ? '#fff' : isDone ? '#fff' : '#999',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {isDone ? '✓' : step}
              </span>
              {STEP_LABELS[step].label}
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 16,
                  height: 2,
                  backgroundColor: isDone ? '#1677ff' : '#e8e8e8',
                  transition: 'background-color 0.3s',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
