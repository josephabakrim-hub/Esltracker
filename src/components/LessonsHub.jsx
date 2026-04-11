// ── LESSONS HUB ──
// Games live at public/games/unit{N}-{bookSlug}.html
// Book slugs: kidsboxng1, kidsboxng2, kidsboxng3, kidsboxng4,
//             thinkstarter, thinkl2, thinkl3
// Completion: game fires postMessage({ type:'UNIT_COMPLETE', unit:N, book:'slug' })
// Progress stored in student Firestore doc: unitsCompleted: { slug: [0,1,2,...] }

import { useState, useEffect, useRef, useCallback } from 'react'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

const BASE = 'https://teacherjoseph.vercel.app/games'

// ── Book definitions ─────────────────────────────────────────────────────────
const BOOKS = {
  kidsboxng1: {
    label: 'Kids Box NG — Level 1',
    units: [
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
    ],
  },
  kidsboxng2: {
    label: 'Kids Box NG — Level 2',
    units: [
      { num: 1,  title: 'Hello Again!'   },
      { num: 2,  title: 'Back to School' },
      { num: 3,  title: 'Play Time!'     },
      { num: 4,  title: 'At Home'        },
      { num: 5,  title: 'Meet My Family' },
      { num: 6,  title: 'Dinner Time'    },
      { num: 7,  title: 'At the Farm'    },
      { num: 8,  title: 'My Town'        },
      { num: 9,  title: 'Our Clothes'    },
      { num: 10, title: 'Our Hobbies'    },
      { num: 11, title: 'My Birthday'    },
      { num: 12, title: 'On Holiday!'    },
    ],
  },
  kidsboxng3: {
    label: 'Kids Box NG — Level 3',
    units: [
      { num: 0, title: 'Hello!'              },
      { num: 1, title: 'Family Matters'      },
      { num: 2, title: 'Home Sweet Home'     },
      { num: 3, title: 'A Day in the Life'   },
      { num: 4, title: 'In the City'         },
      { num: 5, title: 'Fit and Well'        },
      { num: 6, title: 'In the Countryside'  },
      { num: 7, title: 'World of Animals'    },
      { num: 8, title: 'Weather Report'      },
    ],
  },
  kidsboxng4: {
    label: 'Kids Box NG — Level 4',
    units: [
      { num: 0, title: 'Hello There!'        },
      { num: 1, title: 'Back to School'      },
      { num: 2, title: 'Good Sports'         },
      { num: 3, title: 'Health Matters'      },
      { num: 4, title: 'After School Club'   },
      { num: 5, title: 'Exploring Our World' },
      { num: 6, title: 'Technology'          },
      { num: 7, title: 'At the Zoo'          },
      { num: 8, title: "Let's Party!"        },
    ],
  },
  thinkstarter: {
    label: 'Think — Starter',
    units: [
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
    ],
  },
  thinkl2: {
    label: 'Think — Level 2',
    units: [
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
    ],
  },
  thinkl3: {
    label: 'Think — Level 3',
    units: [
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
    ],
  },
}

// ── Class → book slug mapping ────────────────────────────────────────────────
const CLASS_BOOK = {
  'Elite2_2':  'thinkl2',
  'Elite3_S':  'thinkstarter',
  'Elite1_3':  'thinkl3',
  'ATB_Elite3_S': 'thinkstarter',
  'ATB_Elite1_3': 'thinkl3',
  'Pro1_3':    'kidsboxng3',
  'Pro5_4':    'kidsboxng4',
  'Pro1_2':    'kidsboxng2',
  'Pro3_S':    'kidsboxng1',
  'Pro2_2':    'kidsboxng2',
  'Pro3_1':    'kidsboxng1',
  'Pro6_2':    'kidsboxng3',
  'ATB_Pro1_3': 'kidsboxng3',
  'ATB_Pro5_4': 'kidsboxng4',
  'HTB_Pro1-2': 'kidsboxng2',
  'HTB_Pro2_2': 'kidsboxng2',
  'HTB_Pro4-3': 'kidsboxng4',
  'HTB_Pro3_1': 'kidsboxng1',
  'HTB_Pro1_2': 'kidsboxng2',
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getBookSlug(className) {
  // Try exact match first, then try stripping prefix
  if (CLASS_BOOK[className]) return CLASS_BOOK[className]
  const stripped = className.replace(/^(ATB_|HTB_)/, '')
  return CLASS_BOOK[stripped] || null
}

async function markUnitComplete(studentId, bookSlug, unitNum) {
  if (!studentId) return
  const ref = doc(db, 'tj_students', studentId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data = snap.data()
  const existing = data.unitsCompleted || {}
  const bookDone = existing[bookSlug] || []
  if (bookDone.includes(unitNum)) return // already recorded
  await updateDoc(ref, {
    [`unitsCompleted.${bookSlug}`]: [...bookDone, unitNum],
  })
}

// ── Main component ───────────────────────────────────────────────────────────
export default function LessonsHub({ cls, studentId, completedUnits = {}, onClose, readOnly }) {
  const bookSlug = getBookSlug(cls?.name)
  const book     = BOOKS[bookSlug]

  // completed unit numbers for this book
  const done = completedUnits[bookSlug] || []

  // iframe state
  const [openUnit, setOpenUnit] = useState(null)
  const iframeRef = useRef(null)

  // Listen for completion signal from game iframe
  const handleMessage = useCallback(async (e) => {
    if (e.data?.type !== 'UNIT_COMPLETE') return
    const { unit, book: msgBook } = e.data
    if (msgBook !== bookSlug) return
    await markUnitComplete(studentId, bookSlug, unit)
    setOpenUnit(null)
  }, [studentId, bookSlug])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  if (!bookSlug || !book) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-title">📚 Lessons Hub</div>
          <div style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>
            No book assigned to class <strong>{cls?.name}</strong>. Add it to CLASS_BOOK in LessonsHub.jsx.
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    )
  }

  const units = book.units
  const totalDone = done.length
  const progressPct = Math.round((totalDone / units.length) * 100)

  function isUnlocked(unitNum, idx) {
    // Teacher always sees everything unlocked
    if (!readOnly) return true
    // First unit always unlocked for students
    if (idx === 0) return true
    // Otherwise previous unit must be completed
    const prevNum = units[idx - 1].num
    return done.includes(prevNum)
  }

  function isDone(unitNum) {
    return done.includes(unitNum)
  }

  function handleUnitClick(unit, idx) {
    if (!isUnlocked(unit.num, idx)) return
    const url = `${BASE}/unit${unit.num}-${bookSlug}.html`
    if (!readOnly) {
      // Teacher: open in new tab
      window.open(url, '_blank')
    } else {
      // Student: open in iframe inside modal
      setOpenUnit({ ...unit, url })
    }
  }

  // ── Iframe view ──────────────────────────────────────────────────────────
  if (openUnit) {
    return (
      <div className="modal-overlay">
        <div style={{
          width: '100%', maxWidth: 900, height: '92vh',
          background: 'var(--surface)', borderRadius: 20,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        }}>
          {/* iframe header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', background: 'var(--text)', borderRadius: '20px 20px 0 0',
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
                Unit {openUnit.num} — {openUnit.title}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginTop: 2 }}>
                {book.label.toUpperCase()}
              </div>
            </div>
            <button className="btn-ghost" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}
              onClick={() => setOpenUnit(null)}>✕</button>
          </div>
          <iframe
            ref={iframeRef}
            src={openUnit.url}
            style={{ flex: 1, border: 'none', width: '100%' }}
            title={`Unit ${openUnit.num}`}
          />
        </div>
      </div>
    )
  }

  // ── Main list view ───────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: 0 }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: 'var(--text)', color: '#fff', padding: '20px 24px', borderRadius: '20px 20px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                📚 Lessons Hub — <span style={{ color: 'var(--accent)' }}>{cls?.name}</span>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
                {book.label.toUpperCase()} · {totalDone}/{units.length} UNITS DONE
              </div>
            </div>
            <button className="btn-ghost" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} onClick={onClose}>✕</button>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 14, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Unit list */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {units.map((unit, idx) => {
            const unlocked = isUnlocked(unit.num, idx)
            const completed = isDone(unit.num)

            return (
              <div
                key={unit.num}
                onClick={() => handleUnitClick(unit, idx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 12,
                  background: completed ? 'rgba(26,158,92,0.06)' : unlocked ? 'var(--surface)' : 'var(--surface2)',
                  border: `1.5px solid ${completed ? 'rgba(26,158,92,0.25)' : unlocked ? 'var(--border)' : 'transparent'}`,
                  cursor: unlocked ? 'pointer' : 'default',
                  opacity: unlocked ? 1 : 0.45,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (unlocked) { e.currentTarget.style.borderColor = completed ? 'var(--green)' : 'var(--accent)'; e.currentTarget.style.transform = 'translateX(4px)' }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor = completed ? 'rgba(26,158,92,0.25)' : unlocked ? 'var(--border)' : 'transparent'; e.currentTarget.style.transform = '' }}
              >
                {/* Unit number circle */}
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: completed ? 'var(--green)' : unlocked ? 'var(--accent)' : 'var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 800,
                  color: unlocked ? '#fff' : 'var(--muted)',
                }}>
                  {completed ? '✓' : unit.num}
                </div>

                {/* Title */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: unlocked ? 'var(--text)' : 'var(--muted)' }}>
                    {unit.title}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, marginTop: 2 }}>
                    {completed ? 'Completed ✓' : unlocked ? 'Vocabulary · Grammar · Games · Activities' : '🔒 Complete previous unit to unlock'}
                  </div>
                </div>

                {/* Status badge */}
                {completed ? (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 20, letterSpacing: 1, background: 'rgba(26,158,92,0.12)', color: 'var(--green)', border: '1px solid rgba(26,158,92,0.2)' }}>
                    DONE
                  </div>
                ) : unlocked ? (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 20, letterSpacing: 1, background: 'rgba(232,93,38,0.1)', color: 'var(--accent)', border: '1px solid rgba(232,93,38,0.2)' }}>
                    ▶ PLAY
                  </div>
                ) : (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '4px 10px', borderRadius: 20, letterSpacing: 1, background: 'var(--border)', color: 'var(--muted)' }}>
                    🔒
                  </div>
                )}
              </div>
            )
          })}

          {/* Info footer */}
          <div style={{ marginTop: 8, padding: '12px 14px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 4 }}>
              {readOnly ? 'HOW TO UNLOCK' : 'TEACHER VIEW — ALL UNITS ACCESSIBLE'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              {readOnly
                ? 'Complete each unit to unlock the next one. Finish the games and exercises at the end of each lesson to mark it complete.'
                : 'As teacher you can access any unit directly. Students unlock units sequentially as they complete each one.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
