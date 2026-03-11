import { avgSkills, scoreColor } from '../lib/utils'

export default function StatsBar({ students, classes }) {
  const total = students.length
  const avg = total ? Math.round(students.reduce((s, st) => s + avgSkills(st), 0) / total) : 0
  const ready = students.filter(s => s.goal === 'Ready to advance').length
  const needs = students.filter(s => s.goal === 'Needs attention').length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
      {[
        { label: 'Total Students', val: total,   sub: `across ${classes.length} classes`,    color: 'var(--text)' },
        { label: 'Avg. Score',     val: `${avg}%`, sub: 'all skills combined',               color: scoreColor(avg) },
        { label: 'Ready to Advance', val: ready, sub: 'students leveling up',               color: 'var(--green)' },
        { label: 'Needs Attention',  val: needs, sub: 'require focus',                      color: 'var(--red)' },
      ].map(c => (
        <div key={c.label} style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', padding: 20,
          boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>{c.label}</div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, color: c.color }}>{c.val}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.sub}</div>
        </div>
      ))}
    </div>
  )
}
