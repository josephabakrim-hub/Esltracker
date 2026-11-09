import { useState, useMemo } from 'react'
import { STRATEGIES, AREAS, BANDS, bandOf, EVIDENCE_BASE } from '../lib/eslStrategies'

// ─────────────────────────────────────────────────────────────────────────────
//  📊 STRATEGY LAB  (Teacher Academy tool)
//  42 ESL teaching strategies, each with a success rate, ranked and broken down.
// ─────────────────────────────────────────────────────────────────────────────

const mean = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)
const median = a => {
  if (!a.length) return 0
  const s = [...a].sort((x, y) => x - y), m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
const sd = a => {
  const m = mean(a)
  return Math.sqrt(mean(a.map(x => (x - m) ** 2)))
}
const areaOf = id => AREAS.find(a => a.id === id)
const LABEL = { fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase' }
const CARD = { padding: 22, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }

function Bar({ value, color, height = 10 }) {
  return (
    <div style={{ height, borderRadius: height / 2, background: 'var(--border)', overflow: 'hidden', flex: 1, minWidth: 40 }}>
      <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, value))}%`, background: color, borderRadius: height / 2 }} />
    </div>
  )
}

function Pill({ children, color, solid }) {
  return (
    <span style={{
      display: 'inline-block', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, padding: '3px 9px', borderRadius: 999,
      background: solid ? color : `${color}1f`, color: solid ? '#fff' : color, border: `1px solid ${color}55`, whiteSpace: 'nowrap',
    }}>{children}</span>
  )
}

function Tile({ label, value, sub, color }) {
  return (
    <div style={{ ...CARD, padding: '16px 18px' }}>
      <div style={LABEL}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.1, margin: '6px 0 2px', color: color || 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{sub}</div>
    </div>
  )
}

function MiniMeters({ s }) {
  const rows = [['Evidence', s.e], ['Retention', s.r], ['Engagement', s.g]]
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 78, fontSize: 11, color: 'var(--muted)' }}>{k}</div>
          <Bar value={v} color="var(--accent)" height={7} />
          <div style={{ width: 30, textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700 }}>{v}</div>
        </div>
      ))}
    </div>
  )
}

function StrategyRow({ s, rank, open, onToggle }) {
  const band = bandOf(s.score)
  const area = areaOf(s.area)
  return (
    <div style={{ border: '1px solid var(--border)', borderLeft: `4px solid ${band.color}`, borderRadius: 'var(--radius)', background: 'var(--surface)', marginBottom: 8, overflow: 'hidden' }}>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', flexWrap: 'wrap' }}>
        {rank != null && <div style={{ width: 26, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{rank}</div>}
        <div style={{ flex: '1 1 220px', minWidth: 180 }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 3 }}>{s.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{area?.emoji} {area?.label}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 1 220px', minWidth: 150 }}>
          <Bar value={s.score} color={band.color} height={9} />
          <div style={{ width: 46, textAlign: 'right', fontSize: 17, fontWeight: 900, color: band.color, fontVariantNumeric: 'tabular-nums' }}>{s.score}%</div>
        </div>
        <div style={{ width: 70 }}><Pill color={band.color}>{band.label}</Pill></div>
        <div style={{ fontSize: 14, color: 'var(--muted)', width: 14 }}>{open ? '▴' : '▾'}</div>
      </div>
      {open && (
        <div style={{ padding: '4px 16px 16px', borderTop: '1px solid var(--border)', display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div style={{ paddingTop: 12 }}>
            <div style={LABEL}>Why this rating</div>
            <div style={{ fontSize: 13, lineHeight: 1.65, marginTop: 6 }}>{s.why}</div>
            <div style={{ ...LABEL, marginTop: 14 }}>{s.instead ? 'Do this instead' : 'How to use it in your classes'}</div>
            <div style={{ fontSize: 13, lineHeight: 1.65, marginTop: 6, color: s.instead ? '#15803d' : 'var(--text)' }}>{s.instead || s.use}</div>
          </div>
          <div style={{ paddingTop: 12 }}>
            <div style={LABEL}>Score breakdown</div>
            <div style={{ marginTop: 8 }}><MiniMeters s={s} /></div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <Pill color="#64748b">Prep: {s.effort}</Pill>
              <Pill color="#64748b">Results in: {s.speed.toLowerCase()}</Pill>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function StrategyLab() {
  const [view, setView] = useState('overview') // overview | ranking | low
  const [area, setArea] = useState('all')
  const [bandF, setBandF] = useState('all')
  const [sort, setSort] = useState('score')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(null)

  const scores = useMemo(() => STRATEGIES.map(s => s.score), [])
  const stats = useMemo(() => {
    const byBand = BANDS.map(b => ({ ...b, items: STRATEGIES.filter(s => bandOf(s.score).id === b.id) }))
    const byArea = AREAS.map(a => {
      const items = STRATEGIES.filter(s => s.area === a.id)
      const sc = items.map(s => s.score)
      return { ...a, items, avg: mean(sc), min: Math.min(...sc), max: Math.max(...sc), low: items.filter(s => s.score < 30).length }
    }).sort((x, y) => y.avg - x.avg)
    const bins = Array.from({ length: 10 }, (_, i) => ({ from: i * 10, to: i * 10 + 9, count: 0 }))
    STRATEGIES.forEach(s => { bins[Math.min(9, Math.floor(s.score / 10))].count += 1 })
    const bySpeed = ['Days', 'Weeks', 'Months'].map(k => {
      const items = STRATEGIES.filter(s => s.speed === k)
      return { k, n: items.length, avg: mean(items.map(s => s.score)), elite: items.filter(s => s.score >= 75).length }
    })
    const ranked = [...STRATEGIES].sort((a, b) => b.score - a.score)
    const good = ranked.filter(s => s.score >= 60)
    return {
      byBand, byArea, bins, bySpeed, ranked,
      quick: good.filter(s => s.effort === 'Low' && s.score >= 70),
      invest: good.filter(s => s.effort !== 'Low' && s.score >= 75),
      avgE: mean(STRATEGIES.map(s => s.e)), avgR: mean(STRATEGIES.map(s => s.r)), avgG: mean(STRATEGIES.map(s => s.g)),
    }
  }, [])
  const maxBin = Math.max(...stats.bins.map(b => b.count))
  const lowList = stats.ranked.filter(s => s.score < 30).reverse() // worst first
  const midList = stats.ranked.filter(s => s.score >= 30 && s.score < 60)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let l = STRATEGIES.filter(s =>
      (area === 'all' || s.area === area) &&
      (bandF === 'all' || bandOf(s.score).id === bandF) &&
      (!q || s.name.toLowerCase().includes(q) || s.why.toLowerCase().includes(q)))
    l = [...l].sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'retention' ? b.r - a.r : sort === 'engagement' ? b.g - a.g : b.score - a.score)
    return l
  }, [area, bandF, sort, query])

  const chip = (on, color = 'var(--accent)') => ({
    fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, padding: '7px 13px', borderRadius: 999, cursor: 'pointer',
    border: `1px solid ${on ? color : 'var(--border)'}`, background: on ? color : 'transparent', color: on ? '#fff' : 'var(--text)',
  })
  const tabStyle = on => ({
    padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 800, borderBottom: `3px solid ${on ? 'var(--accent)' : 'transparent'}`,
    color: on ? 'var(--accent)' : 'var(--muted)', whiteSpace: 'nowrap',
  })

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={LABEL}>Teacher Joseph's Findings</div>
        <div style={{ fontSize: 22, fontWeight: 900, margin: '6px 0 6px' }}>{STRATEGIES.length} ESL Techniques, Ranked by Success Rate</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 720 }}>
          My findings on what works in the ESL classroom: vocabulary, grammar, pronunciation, speaking, reading, writing and motivation. Every technique has a success rate and a breakdown of why, and the weak ones are called out so no class time goes to them.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto' }}>
        <div style={tabStyle(view === 'overview')} onClick={() => setView('overview')}>📊 Overview</div>
        <div style={tabStyle(view === 'ranking')} onClick={() => setView('ranking')}>🏆 Full ranking ({STRATEGIES.length})</div>
        <div style={tabStyle(view === 'low')} onClick={() => setView('low')}>⚠️ Below 30% ({lowList.length})</div>
      </div>

      {/* ───────── OVERVIEW ───────── */}
      {view === 'overview' && (
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <Tile label="Techniques analysed" value={STRATEGIES.length} sub={`across ${AREAS.length} areas of teaching`} />
            <Tile label="Average success" value={`${mean(scores).toFixed(0)}%`} sub={`median ${median(scores).toFixed(0)}% · spread ±${sd(scores).toFixed(0)}`} />
            <Tile label="Elite (75%+)" value={stats.byBand[0].items.length} sub={`${Math.round(stats.byBand[0].items.length / STRATEGIES.length * 100)}% of all techniques`} color={BANDS[0].color} />
            <Tile label="Below 30%" value={lowList.length} sub={`${Math.round(lowList.length / STRATEGIES.length * 100)}% are not worth class time`} color={BANDS[3].color} />
            <Tile label="Best area" value={`${stats.byArea[0].avg.toFixed(0)}%`} sub={`${stats.byArea[0].emoji} ${stats.byArea[0].label}`} color={BANDS[0].color} />
            <Tile label="Weakest area" value={`${stats.byArea[stats.byArea.length - 1].avg.toFixed(0)}%`} sub={`${stats.byArea[stats.byArea.length - 1].emoji} ${stats.byArea[stats.byArea.length - 1].label}`} color={BANDS[2].color} />
          </div>

          {/* band split */}
          <div style={CARD}>
            <div style={{ ...LABEL, marginBottom: 14 }}>How the {STRATEGIES.length} techniques split</div>
            <div style={{ display: 'flex', height: 30, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
              {stats.byBand.map(b => b.items.length > 0 && (
                <div key={b.id} title={`${b.label}: ${b.items.length}`} style={{ width: `${(b.items.length / STRATEGIES.length) * 100}%`, background: b.color, color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{b.items.length}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              {stats.byBand.map(b => (
                <div key={b.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: b.color, marginTop: 4, flexShrink: 0 }} />
                  <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                    <b>{b.label} ({b.range}%)</b><br />
                    <span style={{ color: 'var(--muted)' }}>{b.items.length} techniques · {Math.round(b.items.length / STRATEGIES.length * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* by area */}
          <div style={CARD}>
            <div style={{ ...LABEL, marginBottom: 4 }}>Average success by area</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>The thin line shows the range from the weakest to the strongest technique in that area.</div>
            {stats.byArea.map(a => (
              <div key={a.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5, gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800 }}>{a.emoji} {a.label} <span style={{ fontWeight: 500, color: 'var(--muted)' }}>· {a.items.length} techniques{a.low ? ` · ${a.low} below 30%` : ''}</span></span>
                  <span style={{ fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{a.avg.toFixed(0)}%</span>
                </div>
                <div style={{ position: 'relative', height: 14 }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 7, background: 'var(--border)' }} />
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${a.avg}%`, borderRadius: 7, background: bandOf(a.avg).color }} />
                  <div style={{ position: 'absolute', left: `${a.min}%`, width: `${a.max - a.min}%`, top: 6, height: 2, background: 'var(--text)', opacity: 0.55 }} />
                  <div style={{ position: 'absolute', left: `${a.min}%`, top: 3, width: 2, height: 8, background: 'var(--text)', opacity: 0.55 }} />
                  <div style={{ position: 'absolute', left: `calc(${a.max}% - 2px)`, top: 3, width: 2, height: 8, background: 'var(--text)', opacity: 0.55 }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, fontFamily: 'var(--mono)' }}>range {a.min}% – {a.max}%</div>
              </div>
            ))}
          </div>

          {/* histogram */}
          <div style={CARD}>
            <div style={{ ...LABEL, marginBottom: 4 }}>Distribution of success rates</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>How many techniques fall in each 10-point band.</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 150 }}>
              {stats.bins.map(b => (
                <div key={b.from} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4, visibility: b.count ? 'visible' : 'hidden' }}>{b.count}</div>
                  <div style={{ width: '100%', height: `${(b.count / maxBin) * 100}%`, minHeight: b.count ? 4 : 0, borderRadius: '5px 5px 0 0', background: bandOf(b.from + 5).color }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {stats.bins.map(b => <div key={b.from} style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>{b.from}s</div>)}
            </div>
          </div>

          {/* time to results */}
          <div style={CARD}>
            <div style={{ ...LABEL, marginBottom: 14 }}>How soon you see results</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {stats.bySpeed.map(sp => (
                <div key={sp.k} style={{ padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{sp.k === 'Days' ? '⚡ Within days' : sp.k === 'Weeks' ? '📅 Within weeks' : '🌱 Takes months'}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, margin: '4px 0' }}>{sp.avg.toFixed(0)}%</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sp.n} techniques · {sp.elite} elite · average success</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.6 }}>
              Average scores across all techniques: evidence {stats.avgE.toFixed(0)}, retention {stats.avgR.toFixed(0)}, engagement {stats.avgG.toFixed(0)}.
            </div>
          </div>

          {/* quick wins */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            <div style={CARD}>
              <div style={{ ...LABEL, marginBottom: 4 }}>⚡ Quick wins</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>70%+ and low preparation. Start here.</div>
              {stats.quick.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                  <span>{s.name}</span><b style={{ color: bandOf(s.score).color }}>{s.score}%</b>
                </div>
              ))}
            </div>
            <div style={CARD}>
              <div style={{ ...LABEL, marginBottom: 4 }}>🏗️ Worth the effort</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>75%+ but needs planning. Use in your best lessons.</div>
              {stats.invest.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                  <span>{s.name} <span style={{ color: 'var(--muted)', fontSize: 11 }}>· prep {s.effort.toLowerCase()}</span></span><b style={{ color: bandOf(s.score).color }}>{s.score}%</b>
                </div>
              ))}
            </div>
          </div>

          {/* top 10 */}
          <div style={CARD}>
            <div style={{ ...LABEL, marginBottom: 14 }}>Top 10 techniques</div>
            {stats.ranked.slice(0, 10).map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                <div style={{ width: 22, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{i + 1}</div>
                <div style={{ flex: '1 1 200px', fontSize: 13, fontWeight: 700 }}>{s.name} <span style={{ fontWeight: 500, color: 'var(--muted)', fontSize: 11 }}>· {areaOf(s.area)?.label}</span></div>
                <div style={{ flex: '0 1 220px', display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                  <Bar value={s.score} color={bandOf(s.score).color} />
                  <b style={{ width: 40, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{s.score}%</b>
                </div>
              </div>
            ))}
          </div>

          {/* method */}
          <div style={CARD}>
            <div style={{ ...LABEL, marginBottom: 10 }}>How the success rate is calculated</div>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>
              Each technique gets three ratings from 0 to 100. <b>Evidence</b>: how strongly research supports it. <b>Retention</b>: how likely the learning is to last for weeks. <b>Engagement</b>: how likely learners are to stay involved. The estimated success rate is
              {' '}<b>40% evidence + 40% retention + 20% engagement</b>. Evidence and retention count most because a technique that feels fun but is forgotten by Friday has not produced results.
            </div>
            <div style={{ ...LABEL, margin: '16px 0 8px' }}>Research behind the findings</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.8, color: 'var(--muted)' }}>
              {EVIDENCE_BASE.map(e => <li key={e}>{e}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* ───────── FULL RANKING ───────── */}
      {view === 'ranking' && (
        <div>
          <div style={{ ...CARD, padding: 16, marginBottom: 16, display: 'grid', gap: 12 }}>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search techniques…"
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: 13, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg, transparent)', color: 'var(--text)', fontFamily: 'var(--font)' }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <div style={chip(area === 'all')} onClick={() => setArea('all')}>All areas</div>
              {AREAS.map(a => <div key={a.id} style={chip(area === a.id)} onClick={() => setArea(a.id)}>{a.emoji} {a.label}</div>)}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={chip(bandF === 'all')} onClick={() => setBandF('all')}>All ratings</div>
              {BANDS.map(b => <div key={b.id} style={chip(bandF === b.id, b.color)} onClick={() => setBandF(b.id)}>{b.label} {b.range}</div>)}
              <div style={{ flex: 1 }} />
              <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 12 }}>
                <option value="score">Sort: success rate</option>
                <option value="retention">Sort: retention</option>
                <option value="engagement">Sort: engagement</option>
                <option value="name">Sort: name A–Z</option>
              </select>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{filtered.length} of {STRATEGIES.length} techniques · tap a row for the details</div>
          {filtered.map((s, i) => (
            <StrategyRow key={s.id} s={s} rank={sort === 'name' ? null : i + 1} open={open === s.id} onToggle={() => setOpen(open === s.id ? null : s.id)} />
          ))}
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 13 }}>Nothing matches those filters.</div>}
        </div>
      )}

      {/* ───────── BELOW 30% ───────── */}
      {view === 'low' && (
        <div>
          <div style={{ padding: '16px 18px', borderRadius: 'var(--radius)', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#b91c1c', marginBottom: 4 }}>{lowList.length} of {STRATEGIES.length} techniques score below 30%</div>
            <div style={{ fontSize: 13, lineHeight: 1.65 }}>
              These are common habits that feel productive but rarely produce lasting results. The average of this group is {mean(lowList.map(s => s.score)).toFixed(0)}%, compared with {mean(stats.ranked.filter(s => s.score >= 60).map(s => s.score)).toFixed(0)}% for the strong and elite groups. Most can be fixed with a small change, shown on each card.
            </div>
          </div>
          {lowList.map((s, i) => (
            <div key={s.id} style={{ ...CARD, borderLeft: `4px solid ${BANDS[3].color}`, marginBottom: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900 }}>{i + 1}. {s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{areaOf(s.area)?.emoji} {areaOf(s.area)?.label}</div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: BANDS[3].color, fontVariantNumeric: 'tabular-nums' }}>{s.score}%</div>
              </div>
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                <div>
                  <div style={LABEL}>Why it underperforms</div>
                  <div style={{ fontSize: 13, lineHeight: 1.65, marginTop: 6 }}>{s.why}</div>
                  <div style={{ ...LABEL, marginTop: 12, color: '#15803d' }}>Do this instead</div>
                  <div style={{ fontSize: 13, lineHeight: 1.65, marginTop: 6, color: '#15803d', fontWeight: 600 }}>{s.instead}</div>
                </div>
                <MiniMeters s={s} />
              </div>
            </div>
          ))}

          <div style={{ ...LABEL, margin: '28px 0 6px' }}>Borderline: 30–59%</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Not harmful, but they need one extra step to work. Tap one to see how to fix it.</div>
          {midList.map(s => (
            <StrategyRow key={s.id} s={s} rank={null} open={open === s.id} onToggle={() => setOpen(open === s.id ? null : s.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
