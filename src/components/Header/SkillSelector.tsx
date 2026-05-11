import React from 'react';
import { useAppState } from '../../context/AppContext';
import { SKILLS, getSkillById } from '../../data/skills';
import type { OutputSection } from '../../types';

const selectStyle: React.CSSProperties = {
  height: 28,
  padding: '0 10px',
  fontSize: 12,
  border: '1px solid transparent',
  borderRadius: 6,
  backgroundColor: 'transparent',
  color: '#6b6b67',
  cursor: 'pointer',
  outline: 'none',
  maxWidth: 180,
  fontFamily: 'inherit',
  appearance: 'auto' as React.CSSProperties['appearance'],
};

export function SkillSelector() {
  const { state, dispatch } = useAppState();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skillId = e.target.value;
    const skill = getSkillById(skillId);
    if (!skill) return;

    const outputSections: OutputSection[] = skill.outputs.map((tpl) => ({
      id: tpl.id,
      title: tpl.title,
      content: '',
    }));

    dispatch({ type: 'LOAD_SKILL', payload: { skillId, outputSections } });
  };

  return (
    <select value={state.currentSkillId} onChange={handleChange} style={selectStyle}>
      {SKILLS.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
