export const SKILLS = ['speaking','listening','reading','writing','grammar','vocabulary']
export const SKILL_ICONS = { speaking:'🗣️', listening:'👂', reading:'📖', writing:'✍️', grammar:'📐', vocabulary:'📚' }
export const LEVELS = ['starter','pro','elite']
export const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN']
export const GOALS = ['On track','Ready to advance','Needs attention']
export const LEVEL_COLORS = { starter: 'var(--starter)', pro: 'var(--pro)', elite: 'var(--elite)' }

export function avgSkills(s) {
  if (!s) return 0
  return Math.round(SKILLS.reduce((sum, k) => sum + (s[k] || 0), 0) / SKILLS.length)
}

export function scoreColor(s) {
  if (s >= 80) return 'var(--green)'
  if (s >= 65) return 'var(--accent2)'
  if (s >= 50) return 'var(--gold)'
  return 'var(--red)'
}

export function scoreClass(s) {
  if (s >= 80) return 'sc-excellent'
  if (s >= 65) return 'sc-good'
  if (s >= 50) return 'sc-average'
  return 'sc-weak'
}

export function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export function goalStyle(g) {
  if (g === 'Ready to advance') return { background: 'rgba(26,158,92,0.1)', color: 'var(--green)' }
  if (g === 'On track')         return { background: 'rgba(45,107,228,0.1)', color: 'var(--accent2)' }
  return { background: 'rgba(214,59,59,0.1)', color: 'var(--red)' }
}
