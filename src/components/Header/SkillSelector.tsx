import React from 'react';
import { useAppState } from '../../context/AppContext';
import { SKILLS, getSkillById } from '../../data/skills';
import type { OutputSection } from '../../types';

const selectStyle: React.CSSProperties = {
  padding: '4px 10px',
  fontSize: 13,
  border: '1px solid #d9d9d9',
  borderRadius: 6,
  backgroundColor: '#fff',
  color: '#333',
  cursor: 'pointer',
  outline: 'none',
  maxWidth: 200,
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
