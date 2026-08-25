import { SKILLS, SKILL_ICONS, LEVELS, scoreColor, avgSkills, goalStyle, initials } from '../lib/utils'

const LEVEL_COLOR = { starter: 'var(--starter)', pro: 'var(--pro)', elite: 'var(--elite)' }
const LEVEL_LABEL = { starter: 'Starters', pro: 'Pros', elite: 'Elites' }
const MONTHS_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Parses the 'DD Mon YYYY' strings used by starsLog entries, without relying on native Date parsing
function parseAwardDate(str) {
  if (!str) return null
  const parts = str.split(' ')
  if (parts.length < 3) return null
  const [d, mon, y] = parts
  const mi = MONTHS_ABBR.indexOf(mon)
  if (mi === -1 || !d || !y) return null
  return new Date(Number(y), mi, Number(d))
}

function buildAttendanceTrend(students) {
  const map = {}
  students.forEach(s => {
    const log = s.attendanceLog || {}
    Object.entries(log).forEach(([date, status]) => {
      if (!map[date]) map[date] = { present: 0, total: 0 }
      map[date].total += 1
      if (status === 'present') map[date].present += 1
    })
  })
  const dates = Object.keys(map).sort()
  const last = dates.slice(-10)
  return last.map(d => ({
    label: d.slice(5).replace('-', '/'),
    value: map[d].total ? Math.round((map[d].present / map[d].total) * 100) : 0,
  }))
}

function buildStarsTrend(students) {
  const map = {}
  students.forEach(s => {
    ;(s.starsLog || []).forEach(e => {
      map[e.date] = (map[e.date] || 0) + (e.count || 0)
    })
  })
  const entries = Object.entries(map)
    .map(([date, count]) => ({ date, count, d: parseAwardDate(date) }))
    .filter(e => e.d)
  entries.sort((a, b) => a.d - b.d)
  const last = entries.slice(-14)
  return last.map(e => ({ label: e.date.split(' ').slice(0, 2).join(' '), value: e.count }))
}

function starsInRange(students, from, to) {
  let sum = 0
  students.forEach(s => (s.starsLog || []).forEach(e => {
    const d = parseAwardDate(e.date)
    if (d && d >= from && d < to) sum += (e.count || 0)
  }))
  return sum
}

const cardStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }
const titleStyle = { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }
const captionStyle = { fontSize: 11, color: 'var(--muted)', marginBottom: 18 }

function AccentBar({ color }) {
  return <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />
}

function KpiCard({ icon, label, value, sub, color, deltaText, deltaSign }) {
  return (
    <div style={cardStyle}>
      <AccentBar color={color} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>{icon} {label}</div>
        {deltaText != null && (
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap',
            color: deltaSign > 0 ? 'var(--green)' : deltaSign < 0 ? 'var(--red)' : 'var(--muted)',
          }}>
            {deltaSign > 0 ? '▲' : deltaSign < 0 ? '▼' : '·'} {deltaText}
          </div>
        )}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, color: 'var(--text)', marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>
    </div>
  )
}

function SkillRadar({ overall, byLevel }) {
  const size = 320, cx = size / 2, cy = size / 2 - 4, maxR = 102
  const axes = SKILLS.length

  function point(i, value) {
    const angle = (Math.PI * 2 * i) / axes - Math.PI / 2
    const r = (Math.max(0, Math.min(100, value)) / 100) * maxR
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  }
  function polygonPoints(values) {
    return values.map((v, i) => point(i, v).join(',')).join(' ')
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}>
      {[25, 50, 75, 100].map(r => (
        <polygon key={r} points={SKILLS.map((_, i) => point(i, r).join(',')).join(' ')} fill="none" stroke="var(--border)" strokeWidth="1" />
      ))}
      {SKILLS.map((sk, i) => {
        const [x, y] = point(i, 100)
        return <line key={sk} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />
      })}
      {byLevel.map(l => (
        <polygon key={l.level} points={polygonPoints(l.values)} fill={l.color} fillOpacity="0.05" stroke={l.color} strokeWidth="1.5" strokeDasharray="4 3" />
      ))}
      <polygon points={polygonPoints(overall)} fill="var(--accent2)" fillOpacity="0.16" stroke="var(--accent2)" strokeWidth="2.5" strokeLinejoin="round" />
      {overall.map((v, i) => { const [x, y] = point(i, v); return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--accent2)" /> })}
      {SKILLS.map((sk, i) => {
        const [x, y] = point(i, 118)
        return <text key={sk} x={x} y={y} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 16 }}>{SKILL_ICONS[sk]}</text>
      })}
    </svg>
  )
}

function LevelDonut({ counts, total }) {
  const size = 150, r = 56, stroke = 22, cx = size / 2, cy = size / 2
  const circumference = 2 * Math.PI * r
  let cumulative = 0
  const segments = LEVELS.map(lvl => {
    const count = counts[lvl] || 0
    const frac = total ? count / total : 0
    const seg = { lvl, count, frac, offset: cumulative }
    cumulative += frac
    return seg
  }).filter(s => s.count > 0)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface2)" strokeWidth={stroke} />
        {segments.map(s => (
          <circle key={s.lvl} cx={cx} cy={cy} r={r} fill="none" stroke={LEVEL_COLOR[s.lvl]} strokeWidth={stroke}
            strokeDasharray={`${s.frac * circumference} ${circumference}`}
            strokeDashoffset={-s.offset * circumference}
            transform={`rotate(-90 ${cx} ${cy})`} />
        ))}
        <text x={cx} y={cy - 3} textAnchor="middle" style={{ fontSize: 22, fontWeight: 800, fill: 'var(--text)' }}>{total}</text>
        <text x={cx} y={cy + 15} textAnchor="middle" style={{ fontSize: 8, fill: 'var(--muted)', letterSpacing: 1 }}>STUDENTS</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, minWidth: 120 }}>
        {LEVELS.map(lvl => (
          <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: 3, background: LEVEL_COLOR[lvl], flexShrink: 0 }} />
            <div style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{LEVEL_LABEL[lvl]}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
              {counts[lvl] || 0} · {total ? Math.round(((counts[lvl] || 0) / total) * 100) : 0}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GoalBar({ goals, total }) {
  return (
    <div>
      <div style={{ display: 'flex', height: 12, borderRadius: 7, overflow: 'hidden', marginBottom: 14, background: 'var(--surface2)' }}>
        {goals.map(g => (total && g.count > 0) && (
          <div key={g.label} style={{ width: `${(g.count / total) * 100}%`, background: g.color }} title={`${g.label}: ${g.count}`} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {goals.map(g => (
          <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: 3, background: g.color, flexShrink: 0 }} />
            <div style={{ fontSize: 12, flex: 1 }}>{g.label}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: g.color }}>{g.count}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', width: 34, textAlign: 'right' }}>
              {total ? Math.round((g.count / total) * 100) : 0}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrendChart({ data, color, height = 88 }) {
  if (!data || data.length < 2) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 11 }}>
        Not enough sessions logged yet — this fills in as you go.
      </div>
    )
  }
  const width = 400
  const values = data.map(d => d.value)
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = (max - min) || 1
  const stepX = width / (data.length - 1)
  const pts = data.map((d, i) => [i * stepX, height - ((d.value - min) / range) * height])
  const linePath = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1]).join(' ')
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`
  const gradId = 'grad-' + color.replace(/[^a-z0-9]/gi, '')

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={color} />)}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)' }}>{data[0].label}</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)' }}>{data[data.length - 1].label}</span>
      </div>
    </div>
  )
}

export default function AnalyticsView({ students, classes }) {
  const total = students.length
  if (total === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>
      No data yet. Add some students first!
    </div>
  )

  const overallSkillAvgs = SKILLS.map(sk => Math.round(students.reduce((s, st) => s + (st[sk] || 0), 0) / total))
  const levelSkillAvgs = LEVELS.map(lvl => {
    const cs = students.filter(s => s.level === lvl)
    if (!cs.length) return null
    return { level: lvl, color: LEVEL_COLOR[lvl], values: SKILLS.map(sk => Math.round(cs.reduce((s, st) => s + (st[sk] || 0), 0) / cs.length)) }
  }).filter(Boolean)

  const levelCounts = { starter: students.filter(s => s.level === 'starter').length, pro: students.filter(s => s.level === 'pro').length, elite: students.filter(s => s.level === 'elite').length }

  const goals = [
    { label: 'Ready to Advance', count: students.filter(s => s.goal === 'Ready to advance').length, color: 'var(--green)' },
    { label: 'On Track',         count: students.filter(s => s.goal === 'On track').length,         color: 'var(--accent2)' },
    { label: 'Needs Attention',  count: students.filter(s => s.goal === 'Needs attention').length,  color: 'var(--red)' },
  ]
  const needsAttentionList = students.filter(s => s.goal === 'Needs attention').sort((a, b) => avgSkills(a) - avgSkills(b))

  const attendanceTrend = buildAttendanceTrend(students)
  const attendanceAvg = Math.round(students.reduce((s, st) => s + (st.attendance ?? 100), 0) / total)
  const attendanceDelta = attendanceTrend.length >= 2 ? attendanceTrend[attendanceTrend.length - 1].value - attendanceTrend[0].value : null

  const starsTrend = buildStarsTrend(students)
  const totalStarsAllTime = students.reduce((s, st) => s + (st.totalStars || 0), 0)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(startOfToday); tomorrow.setDate(tomorrow.getDate() + 1)
  const sevenAgo = new Date(startOfToday); sevenAgo.setDate(sevenAgo.getDate() - 7)
  const fourteenAgo = new Date(startOfToday); fourteenAgo.setDate(fourteenAgo.getDate() - 14)
  const starsThisWeek = starsInRange(students, sevenAgo, tomorrow)
  const starsLastWeek = starsInRange(students, fourteenAgo, sevenAgo)
  const starsDelta = starsThisWeek - starsLastWeek

  const classStats = classes.map(c => {
    const cs = students.filter(s => s.classId === c.id)
    const avg = cs.length ? Math.round(cs.reduce((sum, s) => sum + avgSkills(s), 0) / cs.length) : 0
    const att = cs.length ? Math.round(cs.reduce((sum, s) => sum + (s.attendance ?? 100), 0) / cs.length) : 0
    const stars = cs.reduce((sum, s) => sum + (s.totalStars || 0), 0)
    const top = cs.length ? [...cs].sort((a, b) => avgSkills(b) - avgSkills(a))[0] : null
    return { id: c.id, name: c.name, level: c.level, count: cs.length, avg, att, stars, top }
  }).sort((a, b) => b.avg - a.avg)

  const topPerformers = [...students].sort((a, b) => avgSkills(b) - avgSkills(a)).slice(0, 6)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 5 }}>Analytics</div>
          <div style={{ fontSize: 21, fontWeight: 800 }}>Class &amp; Student Performance</div>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 0 3px rgba(26,158,92,0.15)' }} />
          LIVE · {total} STUDENTS · {classes.length} CLASSES
        </div>
      </div>

      {/* KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16 }}>
        <KpiCard icon="📊" label="Class Average" value={`${Math.round(students.reduce((s, st) => s + avgSkills(st), 0) / total)}%`}
          sub="all skills combined" color="var(--accent2)" />
        <KpiCard icon="📅" label="Attendance" value={`${attendanceAvg}%`}
          sub={attendanceTrend.length ? `over last ${attendanceTrend.length} sessions` : 'no sessions logged yet'}
          color="var(--green)"
          deltaText={attendanceDelta != null ? `${Math.abs(attendanceDelta)}pt` : null}
          deltaSign={attendanceDelta} />
        <KpiCard icon="⭐" label="Stars This Week" value={starsThisWeek}
          sub={`${totalStarsAllTime} lifetime`} color="var(--gold)"
          deltaText={`${Math.abs(starsDelta)} vs last wk`} deltaSign={starsDelta} />
        <KpiCard icon="⚠️" label="Needs Attention" value={needsAttentionList.length}
          sub={`out of ${total} students`} color="var(--red)" />
      </div>

      {/* RADAR + DISTRIBUTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={cardStyle}>
          <AccentBar color="var(--accent2)" />
          <div style={titleStyle}>🕸️ Skill Balance</div>
          <div style={captionStyle}>Overall class profile, with each level overlaid as a dashed outline</div>
          <SkillRadar overall={overallSkillAvgs} byLevel={levelSkillAvgs} />
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
              <div style={{ width: 10, height: 3, background: 'var(--accent2)', borderRadius: 2 }} /> Overall
            </div>
            {levelSkillAvgs.map(l => (
              <div key={l.level} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
                <div style={{ width: 10, height: 3, background: l.color, borderRadius: 2 }} /> {LEVEL_LABEL[l.level]}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={cardStyle}>
            <AccentBar color="var(--elite)" />
            <div style={titleStyle}>🏫 Students by Level</div>
            <div style={{ marginTop: 16 }}><LevelDonut counts={levelCounts} total={total} /></div>
          </div>
          <div style={cardStyle}>
            <AccentBar color="var(--gold)" />
            <div style={titleStyle}>🎯 Goal Status</div>
            <div style={{ marginTop: 16 }}><GoalBar goals={goals} total={total} /></div>
          </div>
        </div>
      </div>

      {/* TRENDS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={cardStyle}>
          <AccentBar color="var(--green)" />
          <div style={titleStyle}>📅 Attendance Trend</div>
          <div style={captionStyle}>% present across your last recorded sessions</div>
          <TrendChart data={attendanceTrend} color="var(--green)" />
        </div>
        <div style={cardStyle}>
          <AccentBar color="var(--gold)" />
          <div style={titleStyle}>⭐ Stars Awarded</div>
          <div style={captionStyle}>Engagement over the last active sessions</div>
          <TrendChart data={starsTrend} color="var(--gold)" />
        </div>
      </div>

      {/* CLASS COMPARISON */}
      {classes.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <AccentBar color="var(--text)" />
          <div style={titleStyle}>📋 Class Comparison</div>
          <div style={captionStyle}>Ranked by average skill score</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {['Class', 'Students', 'Avg Score', 'Attendance', 'Stars', 'Top Student'].map(h => (
                    <th key={h} style={{ textAlign: h === 'Class' || h === 'Top Student' ? 'left' : 'right', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.5, color: 'var(--muted)', textTransform: 'uppercase', padding: '0 10px 10px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classStats.map(c => (
                  <tr key={c.id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: LEVEL_COLOR[c.level] || 'var(--pro)', marginRight: 8 }} />
                      {c.name}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--mono)' }}>{c.count}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700, color: scoreColor(c.avg) }}>{c.avg}%</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--mono)', color: scoreColor(c.att) }}>{c.att}%</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--gold)' }}>{c.stars > 0 ? `⭐ ${c.stars}` : '—'}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>{c.top ? c.top.nameEn : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TOP PERFORMERS + NEEDS ATTENTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={cardStyle}>
          <AccentBar color="var(--green)" />
          <div style={titleStyle}>🏅 Top Performers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {topPerformers.map((s, i) => {
              const avg = avgSkills(s)
              const cls = classes.find(c => c.id === s.classId)
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: 'var(--surface2)' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: 'var(--muted)', width: 16 }}>{i + 1}</div>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: LEVEL_COLOR[s.level] || 'var(--pro)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{initials(s.nameEn)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nameEn}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{cls ? cls.name : '—'}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: scoreColor(avg) }}>{avg}%</div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={cardStyle}>
          <AccentBar color="var(--red)" />
          <div style={titleStyle}>⚠️ Needs Attention</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {needsAttentionList.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', padding: '10px 0' }}>Nobody flagged right now — nice work.</div>
            )}
            {needsAttentionList.map(s => {
              const avg = avgSkills(s)
              const cls = classes.find(c => c.id === s.classId)
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: 'rgba(214,59,59,0.06)', border: '1px solid rgba(214,59,59,0.15)' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{initials(s.nameEn)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nameEn}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{cls ? cls.name : '—'} · {s.attendance ?? 100}% attendance</div>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>{avg}%</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
