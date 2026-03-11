import { SKILLS, SKILL_ICONS, scoreColor, scoreClass, avgSkills, goalStyle } from '../lib/utils'

export default function AnalyticsView({ students, classes }) {
  const total = students.length
  if (total === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>
      No data yet. Add some students first!
    </div>
  )

  const avgBySkill = SKILLS.map(sk => ({
    sk, avg: Math.round(students.reduce((s, st) => s + (st[sk] || 0), 0) / total)
  }))

  const counts = {
    starter: students.filter(s => s.level === 'starter').length,
    pro:     students.filter(s => s.level === 'pro').length,
    elite:   students.filter(s => s.level === 'elite').length,
  }

  const goals = [
    { label: 'Ready to Advance', count: students.filter(s => s.goal === 'Ready to advance').length, color: 'var(--green)' },
    { label: 'On Track',         count: students.filter(s => s.goal === 'On track').length,         color: 'var(--accent2)' },
    { label: 'Needs Attention',  count: students.filter(s => s.goal === 'Needs attention').length,  color: 'var(--red)' },
  ]

  const cardStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, boxShadow: 'var(--shadow)' }
  const titleStyle = { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 18 }

  function BarRow({ label, value, max, color, suffix = '%' }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 12, width: 90, flexShrink: 0 }}>{label}</div>
        <div style={{ flex: 1, height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${(value/max)*100}%`, height: '100%', borderRadius: 4, background: color }} />
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, width: 40, textAlign: 'right', color }}>{value}{suffix}</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 18 }}>Analytics</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Skill averages */}
        <div style={cardStyle}>
          <div style={titleStyle}>📊 Average Score by Skill</div>
          {avgBySkill.map(({ sk, avg }) => (
            <BarRow key={sk} label={`${SKILL_ICONS[sk]} ${sk}`} value={avg} max={100} color={scoreColor(avg)} />
          ))}
        </div>

        {/* Level distribution */}
        <div style={cardStyle}>
          <div style={titleStyle}>🏫 Students by Level</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 120, marginBottom: 16 }}>
            {[
              { label: 'Starters', count: counts.starter, color: 'var(--starter)' },
              { label: 'Pros',     count: counts.pro,     color: 'var(--pro)'     },
              { label: 'Elites',   count: counts.elite,   color: 'var(--elite)'   },
            ].map(l => (
              <div key={l.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700 }}>{l.count}</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                  <div style={{ width: '100%', height: total ? (l.count / total) * 80 : 0, borderRadius: '6px 6px 0 0', background: l.color }} />
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', textAlign: 'center' }}>{l.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal status */}
        <div style={cardStyle}>
          <div style={titleStyle}>🎯 Goal Status</div>
          {goals.map(g => (
            <BarRow key={g.label} label={g.label} value={g.count} max={total || 1} color={g.color} suffix="" />
          ))}
        </div>

        {/* Attendance */}
        <div style={cardStyle}>
          <div style={titleStyle}>📅 Attendance</div>
          {students.map(s => (
            <BarRow key={s.id} label={s.nameEn.split(' ')[0]} value={s.attendance ?? 100} max={100} color={scoreColor(s.attendance ?? 100)} />
          ))}
        </div>

        {/* Top students */}
        <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
          <div style={titleStyle}>🏅 Top Performers</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {[...students].sort((a,b) => avgSkills(b) - avgSkills(a)).slice(0, 6).map((s, i) => {
              const avg = avgSkills(s)
              const cls = null
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'var(--surface2)' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--muted)', width: 20 }}>{i+1}</div>
                  <div style={{ fontWeight: 700, flex: 1 }}>{s.nameEn.split(' ')[0]}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: scoreColor(avg) }}>{avg}%</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
