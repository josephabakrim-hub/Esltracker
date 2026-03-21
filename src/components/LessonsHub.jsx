// ── LESSONS HUB ──
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TO ADD A NEW GAME:
//   1. Name the file:  unit{N}-{classslug}.html
//   2. Drop it in public/games/ and push to GitHub
//   DONE. No changes to this file ever needed!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useState, useEffect } from 'react'

const BASE = 'https://teacherjoseph.vercel.app/games'

const CLASS_SLUG = {
  'Elite2_2':  'elite22',
  'Elite3_S':  'elite3s',
  'Elite1_3':  'elite13',
  'Pro1_3':    'pro13',
  'Pro5_4':    'pro54',
  'Pro1_2':    'pro12',
  'Pro3_S':    'pro3s',
  'Pro2_2':    'pro22',
  'Pro3_1':    'pro31',
  'Pro6_2':    'pro62',
}

const KIDS_BOX_NG1_UNITS = [
  { num: 0,  title: 'Hello!'         },
  { num: 1,  title: 'Hello!'         },
  { num: 2,  title: 'My School'      },
  { num: 3,  title: 'Favourite Toys' },
  { num: 4,  title: 'My Family'      },
  { num: 5,  title: 'Our Pets'       },
  { num: 6,  title: 'My Face'        },
  { num: 7,  title: 'Wild Animals'   },
  { num: 8,  title: 'My Clothes'     },
  { num: 9,  title: 'Fun Time!'      },
  { num: 10, title: 'At the Funfair' },
  { num: 11, title: 'Our House'      },
  { num: 12, title: 'Party Time!'    },
]

const KIDS_BOX_NG2_UNITS = [
  { num: 0,  title: 'Hello Again!'   },
  { num: 1,  title: 'Back to School' },
  { num: 2,  title: 'Play Time!'     },
  { num: 3,  title: 'At Home'        },
  { num: 4,  title: 'Dinner Time'    },
  { num: 5,  title: 'Meet My Family' },
  { num: 6,  title: 'At the Farm'    },
  { num: 7,  title: 'Our Clothes'    },
  { num: 8,  title: 'My Town'        },
  { num: 9,  title: 'Our Hobbies'    },
  { num: 10, title: 'My Birthday'    },
  { num: 11, title: 'On Holiday!'    },
]

const KIDS_BOX_NG3_UNITS = [
  { num: 0, title: 'Hello!'              },
  { num: 1, title: 'Family Matters'      },
  { num: 2, title: 'Home Sweet Home'     },
  { num: 3, title: 'A Day in the Life'   },
  { num: 4, title: 'In the City'         },
  { num: 5, title: 'Fit and Well'        },
  { num: 6, title: 'In the Countryside'  },
  { num: 7, title: 'World of Animals'    },
  { num: 8, title: 'Weather Report'      },
]

const KIDS_BOX_NG4_UNITS = [
  { num: 0, title: 'Hello There!'        },
  { num: 1, title: 'Back to School'      },
  { num: 2, title: 'Good Sports'         },
  { num: 3, title: 'Health Matters'      },
  { num: 4, title: 'After School Club'   },
  { num: 5, title: 'Exploring Our World' },
  { num: 6, title: 'Technology'          },
  { num: 7, title: 'At the Zoo'          },
  { num: 8, title: "Let's Party!"        },
]

const THINK_STARTER_UNITS = [
  { num: 0,  title: 'Welcome'                 },
  { num: 1,  title: 'One World'               },
  { num: 2,  title: 'I Feel Happy'            },
  { num: 3,  title: 'Me and My Family'        },
  { num: 4,  title: 'In the City'             },
  { num: 5,  title: 'In My Free Time'         },
  { num: 6,  title: 'Friends'                 },
  { num: 7,  title: 'Sporting Life'           },
  { num: 8,  title: 'Dance to the Music'      },
  { num: 9,  title: 'Would You Like Dessert?' },
  { num: 10, title: 'High Flyers'             },
  { num: 11, title: 'A World of Animals'      },
  { num: 12, title: 'Getting About'           },
]

const THINK_L2_UNITS = [
  { num: 0,  title: 'Welcome'              },
  { num: 1,  title: 'Amazing People'       },
  { num: 2,  title: 'The Ways We Learn'    },
  { num: 3,  title: "That's Entertainment" },
  { num: 4,  title: 'Social Networking'    },
  { num: 5,  title: 'My Life in Music'     },
  { num: 6,  title: 'Making a Difference'  },
  { num: 7,  title: 'Future Fun'           },
  { num: 8,  title: 'Science Counts'       },
  { num: 9,  title: "What a Job!"          },
  { num: 10, title: 'Keep Healthy'         },
  { num: 11, title: 'Making the News'      },
  { num: 12, title: 'Playing by the Rules' },
]

const THINK_L3_UNITS = [
  { num: 0,  title: 'Welcome'                     },
  { num: 1,  title: 'Life Plans'                  },
  { num: 2,  title: 'Hard Times'                  },
  { num: 3,  title: "What's in a Name?"           },
  { num: 4,  title: 'Dilemmas'                    },
  { num: 5,  title: 'What a Story!'               },
  { num: 6,  title: 'How Do They Do It?'          },
  { num: 7,  title: 'All the Same?'               },
  { num: 8,  title: "It's a Crime"                },
  { num: 9,  title: 'What Happened?'              },
  { num: 10, title: 'Money'                       },
  { num: 11, title: 'Help!'                       },
  { num: 12, title: 'A First Time for Everything' },
]

const CLASS_BOOKS = {
  'Elite2_2':  { book: 'Think — Level 2',      level: 'elite2'  },
  'Elite3_S':  { book: 'Think — Starter',       level: 'starter' },
  'Elite1_3':  { book: 'Think — Level 3',       level: 'elite3'  },
  'Pro1_3':    { book: 'Kids Box NG — Level 3', level: 'ng3'     },
  'Pro5_4':    { book: 'Kids Box NG — Level 4', level: 'ng4'     },
  'Pro1_2':    { book: 'Kids Box NG — Level 2', level: 'ng2'     },
  'Pro3_S':    { book: 'Kids Box NG — Level 1', level: 'ng1'     },
  'Pro2_2':    { book: 'Kids Box NG — Level 2', level: 'ng2'     },
  'Pro3_1':    { book: 'Kids Box NG — Level 1', level: 'ng1'     },
  'Pro6_2':    { book: 'Kids Box NG — Level 3', level: 'ng3'     },
}

function getUnits(level) {
  if (level === 'starter') return THINK_STARTER_UNITS
  if (level === 'elite2')  return THINK_L2_UNITS
  if (level === 'elite3')  return THINK_L3_UNITS
  if (level === 'ng1')     return KIDS_BOX_NG1_UNITS
  if (level === 'ng2')     return KIDS_BOX_NG2_UNITS
  if (level === 'ng3')     return KIDS_BOX_NG3_UNITS
  if (level === 'ng4')     return KIDS_BOX_NG4_UNITS
  return KIDS_BOX_NG1_UNITS
}

export default function LessonsHub({ cls, onClose }) {
  const bookInfo = CLASS_BOOKS[cls?.name] || { book: 'Unknown Book', level: 'ng1' }
  const slug     = CLASS_SLUG[cls?.name] || ''
  const units    = getUnits(bookInfo.level)

  // Auto-detect which games exist by checking if the file responds
  const [readyMap, setReadyMap] = useState({})

  useEffect(() => {
    if (!slug) return
    const checks = units.map(unit => {
      const url = `${BASE}/unit${unit.num}-${slug}.html`
      return fetch(url, { method: 'HEAD' })
        .then(res => ({ key: `${unit.num}`, ready: res.ok }))
        .catch(() => ({ key: `${unit.num}`, ready: false }))
    })
    Promise.all(checks).then(results => {
      const map = {}
      results.forEach(r => { map[r.key] = r.ready })
      setReadyMap(map)
    })
  }, [slug])

  const unitsWithUrls = units.map(unit => {
    const isReady = !!readyMap[String(unit.num)]
    const url     = `${BASE}/unit${unit.num}-${slug}.html`
    return { ...unit, isReady, url }
  })

  const available = unitsWithUrls.filter(u => u.isReady).length

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580, maxHeight: '88vh', overflowY: 'auto', padding: 0 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: 'var(--text)', color: '#fff', padding: '20px 24px', borderRadius: '20px 20px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                📚 Lessons Hub — <span style={{ color: 'var(--accent)' }}>{cls?.name}</span>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
                {bookInfo.book.toUpperCase()} · {available} OF {units.length} UNITS READY
              </div>
            </div>
            <button className="btn-ghost" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} onClick={onClose}>✕</button>
          </div>
          <div style={{ marginTop: 14, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(available / units.length) * 100}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Unit list */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {unitsWithUrls.map(unit => {
              const isReady = unit.isReady
              return (
                <div
                  key={unit.num}
                  onClick={() => isReady && window.open(unit.url, '_blank')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 12,
                    background: isReady ? 'var(--surface)' : 'var(--surface2)',
                    border: `1.5px solid ${isReady ? 'var(--border)' : 'transparent'}`,
                    cursor: isReady ? 'pointer' : 'default',
                    opacity: isReady ? 1 : 0.55,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (isReady) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateX(4px)' }}}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: isReady ? 'var(--accent)' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 800,
                    color: isReady ? '#1a1814' : 'var(--muted)',
                  }}>
                    {unit.num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isReady ? 'var(--text)' : 'var(--muted)' }}>
                      {unit.title}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, marginTop: 2 }}>
                      {isReady ? 'Vocabulary · Grammar · Games · Activities' : 'Coming soon'}
                    </div>
                  </div>
                  {isReady ? (
                    <div style={{
                      fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700,
                      padding: '4px 10px', borderRadius: 20, letterSpacing: 1,
                      background: 'rgba(26,158,92,0.12)', color: 'var(--green)',
                      border: '1px solid rgba(26,158,92,0.2)',
                    }}>▶ PLAY</div>
                  ) : (
                    <div style={{
                      fontFamily: 'var(--mono)', fontSize: 9,
                      padding: '4px 10px', borderRadius: 20, letterSpacing: 1,
                      background: 'var(--border)', color: 'var(--muted)',
                    }}>🔒 SOON</div>
                  )}
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 20, padding: '12px 14px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 4 }}>HOW IT WORKS</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              New units are added as you teach them. Each unit opens a full interactive lesson with vocabulary games, grammar exercises, speaking prompts and writing tasks — all based on the actual book content.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
