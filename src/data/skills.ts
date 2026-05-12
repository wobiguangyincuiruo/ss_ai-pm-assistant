// All skills are now defined as individual .md files in the skills/ directory.
// This file re-exports from the auto-discovering loader for backward compatibility.
// To add a new skill, just drop a .md file into src/data/skills/ — no code changes needed.
export { SKILLS, getSkillById, DEFAULT_SKILL_ID } from './skills/index';
