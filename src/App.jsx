import { useState, useEffect, useRef } from 'react'
import AccessGate from './components/AccessGate'
import Header from './components/Header'
import Tabs from './components/Tabs'
import StatsBar from './components/StatsBar'
import ClassesView from './components/ClassesView'
import ClassDetail from './components/ClassDetail'
import StudentsView from './components/StudentsView'
import StudentProfile from './components/StudentProfile'
import AnalyticsView from './components/AnalyticsView'
import ClassModal from './components/ClassModal'
import StudentModal from './components/StudentModal'
import NoteModal from './components/NoteModal'
import AttendanceModal from './components/AttendanceModal'
import StarSessionModal from './components/StarSessionModal'
import SpinOfDoomModal from './components/SpinOfDoomModal'
import StarSlotsModal from './components/StarSlotsModal'
import TeacherAcademy from './components/TeacherAcademy'
import AdminPanel from './components/AdminPanel'
import LockedOverlay, { DemoBadge } from './components/LockedOverlay'
import { useClasses } from './hooks/useClasses'
import { useStudents } from './hooks/useStudents'
import { useAccessControl } from './hooks/useAccessControl'
import { TABS as ACCESS_TAB_DEFS, getTabMode, getFeatureMode, getLockMessage, getClassFilter, showsDemoBanner } from './lib/accessControl'

export default function App() {
  const { classes: allClasses, loading: loadingClasses, addClass, updateClass, deleteClass } = useClasses()
  const { students: allStudents, loading: loadingStudents, addStudent, updateStudent, deleteStudent } = useStudents()
  const { config: accessConfig } = useAccessControl()

  const [access, setAccess] = useState(() => {
    try {
      const saved = localStorage.getItem('tj_access')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Keep login/role persisted across refreshes and browser back/forward
  useEffect(() => {
    try {
      if (access) {
        const toSave = access.student
          ? { ...access, student: { ...access.student, pin: undefined } }
          : access
        localStorage.setItem('tj_access', JSON.stringify(toSave))
      } else {
        localStorage.removeItem('tj_access')
      }
    } catch {}
  }, [access])

  // Only teacher has write access — everyone else including students is read-only
  const isTeacher = access?.role === 'teacher'
  const isStudent = access?.role === 'student'
  const studentName = isStudent ? access?.student?.nameEn : null

  // ── Access control: restrict which classes/students a non-teacher role sees ──
  const roleClassFilter = access && !isTeacher ? getClassFilter(accessConfig, access.role) : []
  const classes  = (isTeacher || roleClassFilter.length === 0) ? allClasses : allClasses.filter(c => roleClassFilter.includes(c.id))
  const students = (isTeacher || roleClassFilter.length === 0) ? allStudents : allStudents.filter(s => classes.some(c => c.id === s.classId))

  // Theme
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('tj_theme')
    return saved ? saved === 'dark' : false
  })
  useEffect(() => {
    document.body.classList.toggle('dark', isDark)
    localStorage.setItem('tj_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const DEFAULT_CLASSES = [
    { name: 'ATB_Pro1_3',   level: 'pro',   day: 'MON',       time: '17:30-19:00' },
    { name: 'ATB_Pro5_4',   level: 'pro',   day: 'MON',       time: '19:15-20:45' },
    { name: 'HTB_Pro1-2',   level: 'pro',   day: 'TUE',       time: '17:30-19:00' },
    { name: 'ATB_Elite3_S', level: 'elite', day: 'TUE',       time: '19:15-20:45' },
    { name: 'Pro3_S',       level: 'pro',   day: 'WED',       time: '17:30-19:00' },
    { name: 'Elite2_2',     level: 'elite', day: 'WED & SAT', time: '19:15-20:45 / 15:45-17:15' },
    { name: 'HTB_Pro2_2',   level: 'pro',   day: 'THU',       time: '17:30-19:00' },
    { name: 'HTB_Pro4-3',   level: 'pro',   day: 'THU',       time: '19:15-20:45' },
    { name: 'ATB_Pro5_4',   level: 'pro',   day: 'SAT',       time: '17:30-19:00' },
    { name: 'ATB_Elite1_3', level: 'elite', day: 'SAT',       time: '19:15-20:45' },
    { name: 'HTB_Pro3_1',   level: 'pro',   day: 'SUN',       time: '08:00-09:30' },
    { name: 'HTB_Pro1_2',   level: 'pro',   day: 'SUN',       time: '09:30-11:00' },
  ]
  useEffect(() => {
    if (isTeacher && !loadingClasses && allClasses.length === 0) {
      DEFAULT_CLASSES.forEach(c => addClass({ ...c, students: 0 }))
    }
  }, [loadingClasses, isTeacher])

  const [tab, setTab]                         = useState('classes')
  const [selectedClass, setSelectedClass]     = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentOrigin, setStudentOrigin]     = useState(null)

  const [classModal,       setClassModal]       = useState(null)
  const [studentModal,     setStudentModal]     = useState(null)
  const [noteModal,        setNoteModal]        = useState(null)
  const [attendanceModal,  setAttendanceModal]  = useState(null)
  const [starSessionModal, setStarSessionModal] = useState(null)
  const [spinModal,        setSpinModal]        = useState(null)
  const [starSlotsModal,   setStarSlotsModal]   = useState(null)

  const liveClass   = selectedClass   ? classes.find(c => c.id === selectedClass.id)   || selectedClass   : null
  const liveStudent = selectedStudent ? students.find(s => s.id === selectedStudent.id) || selectedStudent : null

  // ── Teacher-only write handlers — all guarded ────────────────────────────
  async function handleSaveClass(data) {
    if (isTeacher) {
      if (classModal && classModal.id) {
        await updateClass(classModal.id, data)
        if (selectedClass?.id === classModal.id) setSelectedClass(prev => ({ ...prev, ...data }))
      } else {
        await addClass(data)
      }
    }
    // Non-teacher roles only ever reach here in Demo mode — the modal still
    // closes as if it saved, but nothing above actually touched Firestore.
    setClassModal(null)
  }

  async function handleDeleteClass(id) {
    if (!isTeacher) return
    await deleteClass(id)
    if (selectedClass?.id === id) setSelectedClass(null)
  }

  async function handleSaveStudent(data) {
    if (isTeacher) {
      if (studentModal && studentModal.id) {
        await updateStudent(studentModal.id, data)
      } else {
        await addStudent(data)
      }
    }
    setStudentModal(null)
  }

  async function handleDeleteStudent(id) {
    if (!isTeacher) return
    await deleteStudent(id)
    setSelectedStudent(null)
    setTab(studentOrigin === 'class' ? 'classDetail' : 'students')
  }

  async function handleAddNote(text, date) {
    if (!isTeacher) return
    const s = students.find(st => st.id === noteModal)
    if (!s) return
    const notes = [...(s.notes || []), { date, text }]
    notes.sort((a, b) => new Date(b.date) - new Date(a.date))
    await updateStudent(noteModal, { notes })
    setNoteModal(null)
  }

  async function handleSaveAttendance(classId, dateKey, records) {
    if (!isTeacher) return
    const classStudents = students.filter(s => s.classId === classId)
    for (const s of classStudents) {
      const log = { ...(s.attendanceLog || {}), [dateKey]: records[s.id] || 'absent' }
      const total = Object.keys(log).length
      const present = Object.values(log).filter(v => v === 'present').length
      const pct = total > 0 ? Math.round((present / total) * 100) : 100
      await updateStudent(s.id, { attendanceLog: log, attendance: pct })
    }
  }

  async function handleSaveStarSession(sessionStars) {
    if (!isTeacher) return
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    for (const [studentId, count] of Object.entries(sessionStars)) {
      if (count === 0) continue
      const s = students.find(st => st.id === studentId)
      if (!s) continue
      const starsLog = [...(s.starsLog || []), { date: today, count, reason: 'Class session' }]
      const totalStars = starsLog.reduce((sum, e) => sum + e.count, 0)
      await updateStudent(studentId, { starsLog, totalStars })
    }
  }

  async function handleAwardStars(studentId, count, reason, date) {
    if (!isTeacher) return
    const s = students.find(st => st.id === studentId)
    if (!s) return
    const dateLabel = date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const starsLog = [...(s.starsLog || []), { date: dateLabel, count, reason: reason || '' }]
    const totalStars = starsLog.reduce((sum, e) => sum + e.count, 0)
    await updateStudent(studentId, { starsLog, totalStars })
  }

  async function handleDeleteStar(studentId, index) {
    if (!isTeacher) return
    const s = students.find(st => st.id === studentId)
    if (!s) return
    const starsLog = (s.starsLog || []).filter((_, i) => i !== index)
    const totalStars = starsLog.reduce((sum, e) => sum + e.count, 0)
    await updateStudent(studentId, { starsLog, totalStars })
  }

  // ── Access control helpers used throughout the render below ──────────────
  function canOpenFeature(id) { return isTeacher || featureMode(id) !== 'hidden' }
  function featureReadOnly(id) { return isTeacher ? false : featureMode(id) === 'live-view' }
  function isFeatureDemo(id) { return !isTeacher && featureMode(id) === 'demo' }

  function openClass(cls) { setSelectedClass(cls); setTab('classDetail') }
  function openStudentFromClass(s) { setSelectedStudent(s); setStudentOrigin('class'); setTab('studentProfile') }
  function openStudentFromList(s) { setSelectedStudent(s); setStudentOrigin('students'); setTab('studentProfile') }
  function handleBackFromStudent() { setSelectedStudent(null); setTab(studentOrigin === 'class' ? 'classDetail' : 'students') }

  const isLoading = loadingClasses || loadingStudents
  const activeTab = tab === 'classDetail' ? 'classes'
                  : tab === 'studentProfile' ? (studentOrigin === 'class' ? 'classes' : 'students')
                  : tab

  // ── Access control: tab visibility for the current non-teacher role ──────
  const roleId = access?.role
  function tabMode(tabId) {
    if (isTeacher) return 'visible'
    return getTabMode(accessConfig, roleId, tabId)
  }
  function featureMode(featureId) {
    if (isTeacher) return 'live'
    return getFeatureMode(accessConfig, roleId, featureId)
  }
  const visibleTabDefs = !isTeacher
    ? ACCESS_TAB_DEFS.filter(t => tabMode(t.id) !== 'hidden')
        .map(t => ({ ...t, label: tabMode(t.id) === 'blurred' ? `🔒 ${t.label}` : t.label }))
    : undefined // teacher gets the default 5-tab set defined inline below

  // If an admin revokes access to the tab someone is currently on, bounce them
  // to the first tab still available to their role rather than showing nothing.
  useEffect(() => {
    if (isTeacher || !access) return
    if (tab === 'classDetail' || tab === 'studentProfile') return
    if (tabMode(tab) === 'hidden') {
      const fallback = ACCESS_TAB_DEFS.find(t => tabMode(t.id) !== 'hidden')
      setTab(fallback ? fallback.id : 'classes')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessConfig, access, tab])

  function handleTabChange(t) { setSelectedClass(null); setSelectedStudent(null); setStudentOrigin(null); setTab(t) }

  // ── Browser Back/Forward navigation ───────────────────────────────────────
  // Every screen you visit (a tab, a class, a student profile) becomes a real
  // history entry, so Back retraces exactly what you looked at, in order —
  // just like a normal website. Modals are never part of history — Back
  // simply closes them first, without changing the screen underneath.
  //
  // The one entry that existed *before* the app ever touched history is
  // marked as the "floor". If Back ever lands there, we immediately push
  // forward again, so the browser Back button can never actually leave the app.
  const modalsRef = useRef({})
  modalsRef.current = { classModal, studentModal, noteModal, attendanceModal, starSessionModal, spinModal, starSlotsModal }

  const initializedRef  = useRef(false)  // true once the floor + home entries are set up
  const skipNextPushRef = useRef(false)  // true right after we replay a popped entry, so the
                                          // location-tracking effect below doesn't re-push it

  function closeAllModals() {
    setClassModal(null); setStudentModal(null); setNoteModal(null)
    setAttendanceModal(null); setStarSessionModal(null); setSpinModal(null); setStarSlotsModal(null)
  }

  function applyLocation(loc) {
    skipNextPushRef.current = true
    setSelectedClass(loc.classId ? { id: loc.classId } : null)
    setSelectedStudent(loc.studentId ? { id: loc.studentId } : null)
    setStudentOrigin(loc.studentOrigin || null)
    setTab(loc.tab)
  }

  // One-time setup: mark the floor, then push the home screen on top of it.
  useEffect(() => {
    window.history.replaceState({ tjFloor: true }, '')
    window.history.pushState({ tjApp: true, tab: 'classes', classId: null, studentId: null, studentOrigin: null }, '')
    initializedRef.current = true

    function handlePopState(e) {
      const state = e.state

      // Hit the floor (or a foreign/unrecognised entry) — refuse to exit.
      if (!state || state.tjFloor) {
        window.history.pushState({ tjApp: true, tab: 'classes', classId: null, studentId: null, studentOrigin: null }, '')
        closeAllModals()
        applyLocation({ tab: 'classes', classId: null, studentId: null, studentOrigin: null })
        return
      }

      // A modal is open — the first Back press just closes it and re-arms
      // this same entry, so the screen underneath doesn't change yet.
      const m = modalsRef.current
      if (m.classModal || m.studentModal || m.noteModal || m.attendanceModal || m.starSessionModal || m.spinModal || m.starSlotsModal) {
        window.history.pushState(state, '')
        closeAllModals()
        return
      }

      // Otherwise, replay whichever screen we've landed back on.
      applyLocation(state)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Whenever the visible screen actually changes, record it as a new entry.
  useEffect(() => {
    if (!initializedRef.current) return
    if (skipNextPushRef.current) { skipNextPushRef.current = false; return }

    const loc = { tab, classId: selectedClass?.id || null, studentId: selectedStudent?.id || null, studentOrigin }
    const current = window.history.state
    const unchanged = current && current.tjApp &&
      current.tab === loc.tab && current.classId === loc.classId &&
      current.studentId === loc.studentId && current.studentOrigin === loc.studentOrigin
    if (!unchanged) window.history.pushState({ tjApp: true, ...loc }, '')
  }, [tab, selectedClass?.id, selectedStudent?.id, studentOrigin])

  // ── Gate ─────────────────────────────────────────────────────────────────
  if (!access) return <AccessGate onAccess={setAccess} />

  // ── Main app — teacher gets full control, everyone else read-only ─────────
  return (
    <div>
      <Header
        onAddClass={canOpenFeature('addClass') ? () => setClassModal('add') : null}
        onAddStudent={canOpenFeature('addStudent') ? () => setStudentModal('add') : null}
        isDark={isDark}
        onToggleTheme={() => setIsDark(d => !d)}
        readOnly={!isTeacher}
        role={access.role}
        onSwitchRole={() => setAccess(null)}
        studentName={studentName}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
        <Tabs
          active={activeTab}
          onChange={handleTabChange}
          tabs={isTeacher ? [
            { id: 'classes',   label: '🏫 Classes'   },
            { id: 'students',  label: '👤 Students'  },
            { id: 'analytics', label: '📊 Analytics' },
            { id: 'academy',   label: '🎓 Academy'   },
            { id: 'admin',     label: '🔐 Admin'     },
          ] : visibleTabDefs}
        />

        {isLoading && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>Loading...</div>
        )}

        {!isLoading && <>
          {tab === 'classes' && (
            tabMode('classes') === 'blurred' ? (
              <LockedOverlay message={getLockMessage(accessConfig, roleId, 'classes')}>
                <StatsBar students={students} classes={classes} />
                <ClassesView classes={classes} students={students} onSelectClass={() => {}} readOnly />
              </LockedOverlay>
            ) : (
              <><StatsBar students={students} classes={classes} />
              <ClassesView classes={classes} students={students} onSelectClass={openClass}
                onAddClass={canOpenFeature('addClass') ? () => setClassModal('add') : null}
                onEditClass={isTeacher ? c => setClassModal(c) : null}
                onDeleteClass={isTeacher ? handleDeleteClass : null}
                readOnly={!isTeacher}
              /></>
            )
          )}

          {tab === 'classDetail' && liveClass && (
            <ClassDetail cls={liveClass} students={students.filter(s => s.classId === liveClass.id)}
              onBack={() => { setSelectedClass(null); setTab('classes') }}
              onSelectStudent={openStudentFromClass}
              onAddStudent={canOpenFeature('addStudent') ? () => setStudentModal('add') : null}
              onEditClass={isTeacher ? c => setClassModal(c) : null}
              onOpenAttendance={canOpenFeature('attendance') ? () => setAttendanceModal(liveClass.id) : null}
              onOpenStarSession={canOpenFeature('starSession') ? () => setStarSessionModal(liveClass.id) : null}
              onOpenSpinOfDoom={canOpenFeature('spinOfDoom') ? () => setSpinModal(liveClass.id) : null}
              onOpenStarSlots={canOpenFeature('starSlots') ? () => setStarSlotsModal(liveClass.id) : null}
              studentId={isStudent ? access?.student?.id : null}
              completedUnits={isStudent ? (students.find(s => s.id === access?.student?.id)?.unitsCompleted || {}) : {}}
              readOnly={!isTeacher}
            />
          )}

          {tab === 'students' && (
            tabMode('students') === 'blurred' ? (
              <LockedOverlay message={getLockMessage(accessConfig, roleId, 'students')}>
                <StatsBar students={students} classes={classes} />
                <StudentsView students={students} classes={classes} onSelectStudent={() => {}} readOnly />
              </LockedOverlay>
            ) : (
              <><StatsBar students={students} classes={classes} />
              <StudentsView students={students} classes={classes} onSelectStudent={openStudentFromList}
                onAddStudent={canOpenFeature('addStudent') ? () => setStudentModal('add') : null}
                onEditStudent={isTeacher ? s => setStudentModal(s) : null}
                readOnly={!isTeacher}
              /></>
            )
          )}

          {tab === 'studentProfile' && liveStudent && (
            <StudentProfile student={liveStudent} classes={classes}
              onBack={handleBackFromStudent}
              onEdit={isTeacher ? () => setStudentModal(liveStudent) : null}
              onAddNote={canOpenFeature('notes') ? () => setNoteModal(liveStudent.id) : null}
              onDelete={isTeacher ? handleDeleteStudent : null}
              onAddStars={isTeacher ? handleAwardStars : null}
              onDeleteStar={isTeacher ? handleDeleteStar : null}
              readOnly={!isTeacher}
            />
          )}

          {tab === 'analytics' && (
            tabMode('analytics') === 'blurred' ? (
              <LockedOverlay message={getLockMessage(accessConfig, roleId, 'analytics')}>
                <StatsBar students={students} classes={classes} />
                <AnalyticsView students={students} classes={classes} />
              </LockedOverlay>
            ) : (
              <><StatsBar students={students} classes={classes} />
              <AnalyticsView students={students} classes={classes} /></>
            )
          )}

          {tab === 'academy' && (isTeacher || tabMode('academy') !== 'hidden') && (
            tabMode('academy') === 'blurred' ? (
              <LockedOverlay message={getLockMessage(accessConfig, roleId, 'academy')}>
                <TeacherAcademy />
              </LockedOverlay>
            ) : (
              <TeacherAcademy />
            )
          )}

          {tab === 'admin' && isTeacher && (
            <AdminPanel
              classes={classes}
              students={students}
              updateClass={updateClass}
              updateStudent={updateStudent}
            />
          )}
        </>}
      </div>

      {/* Add Class / Add Student create real records — only ever Hidden or Demo for non-teachers */}
      {canOpenFeature('addClass')   && classModal   && <ClassModal cls={classModal === 'add' ? null : classModal} onSave={handleSaveClass} onClose={() => setClassModal(null)} />}
      {canOpenFeature('addStudent') && studentModal && <StudentModal student={studentModal === 'add' ? null : studentModal} classes={classes} onSave={handleSaveStudent} onClose={() => setStudentModal(null)} />}

      {/* These four can be opened by other roles too, if Access Control grants Demo or View-only access.
          featureReadOnly() decides interactivity; the write handlers themselves already no-op for
          anyone but the teacher, so a "Demo" role can click around freely and nothing is ever saved. */}
      {canOpenFeature('notes')       && noteModal        && <NoteModal studentName={students.find(s => s.id === noteModal)?.nameEn || ''} onSave={handleAddNote} onClose={() => setNoteModal(null)} />}
      {canOpenFeature('attendance')  && attendanceModal  && <AttendanceModal cls={classes.find(c => c.id === attendanceModal)} students={students.filter(s => s.classId === attendanceModal)} onSave={handleSaveAttendance} onClose={() => setAttendanceModal(null)} readOnly={featureReadOnly('attendance')} />}
      {canOpenFeature('starSession') && starSessionModal && <StarSessionModal cls={classes.find(c => c.id === starSessionModal)} students={students.filter(s => s.classId === starSessionModal)} onSave={handleSaveStarSession} onClose={() => setStarSessionModal(null)} readOnly={featureReadOnly('starSession')} />}
      {canOpenFeature('spinOfDoom')  && spinModal        && <SpinOfDoomModal cls={classes.find(c => c.id === spinModal)} students={students.filter(s => s.classId === spinModal)} onAwardStars={handleAwardStars} onUpdateClass={updateClass} onClose={() => setSpinModal(null)} readOnly={featureReadOnly('spinOfDoom')} />}
      {canOpenFeature('starSlots')   && starSlotsModal   && <StarSlotsModal cls={classes.find(c => c.id === starSlotsModal)} students={students.filter(s => s.classId === starSlotsModal)} onAwardStars={handleAwardStars} onClose={() => setStarSlotsModal(null)} readOnly={featureReadOnly('starSlots')} />}

      {/* Floating "demo, not saved" badge — shown whenever a non-teacher has a demo feature open */}
      {!isTeacher && showsDemoBanner(accessConfig, roleId) && (
        (isFeatureDemo('attendance') && attendanceModal) ||
        (isFeatureDemo('starSession') && starSessionModal) ||
        (isFeatureDemo('spinOfDoom') && spinModal) ||
        (isFeatureDemo('starSlots') && starSlotsModal) ||
        (isFeatureDemo('notes') && noteModal) ||
        (isFeatureDemo('addClass') && classModal) ||
        (isFeatureDemo('addStudent') && studentModal)
      ) && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 300 }}>
          <DemoBadge />
        </div>
      )}
    </div>
  )
}
