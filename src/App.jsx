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
import { useClasses } from './hooks/useClasses'
import { useStudents } from './hooks/useStudents'

export default function App() {
  const { classes, loading: loadingClasses, addClass, updateClass, deleteClass } = useClasses()
  const { students, loading: loadingStudents, addStudent, updateStudent, deleteStudent } = useStudents()

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
    if (!loadingClasses && classes.length === 0) {
      DEFAULT_CLASSES.forEach(c => addClass({ ...c, students: 0 }))
    }
  }, [loadingClasses])

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
    if (!isTeacher) return
    if (classModal && classModal.id) {
      await updateClass(classModal.id, data)
      if (selectedClass?.id === classModal.id) setSelectedClass(prev => ({ ...prev, ...data }))
    } else {
      await addClass(data)
    }
    setClassModal(null)
  }

  async function handleDeleteClass(id) {
    if (!isTeacher) return
    await deleteClass(id)
    if (selectedClass?.id === id) setSelectedClass(null)
  }

  async function handleSaveStudent(data) {
    if (!isTeacher) return
    if (studentModal && studentModal.id) {
      await updateStudent(studentModal.id, data)
    } else {
      await addStudent(data)
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

  function openClass(cls) { setSelectedClass(cls); setTab('classDetail') }
  function openStudentFromClass(s) { setSelectedStudent(s); setStudentOrigin('class'); setTab('studentProfile') }
  function openStudentFromList(s) { setSelectedStudent(s); setStudentOrigin('students'); setTab('studentProfile') }
  function handleBackFromStudent() { setSelectedStudent(null); setTab(studentOrigin === 'class' ? 'classDetail' : 'students') }

  const isLoading = loadingClasses || loadingStudents
  const activeTab = tab === 'classDetail' ? 'classes'
                  : tab === 'studentProfile' ? (studentOrigin === 'class' ? 'classes' : 'students')
                  : tab

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
        onAddClass={isTeacher ? () => setClassModal('add') : null}
        onAddStudent={isTeacher ? () => setStudentModal('add') : null}
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
          ] : undefined}
        />

        {isLoading && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>Loading...</div>
        )}

        {!isLoading && <>
          {tab === 'classes' && (
            <><StatsBar students={students} classes={classes} />
            <ClassesView classes={classes} students={students} onSelectClass={openClass}
              onAddClass={isTeacher ? () => setClassModal('add') : null}
              onEditClass={isTeacher ? c => setClassModal(c) : null}
              onDeleteClass={isTeacher ? handleDeleteClass : null}
              readOnly={!isTeacher}
            /></>
          )}

          {tab === 'classDetail' && liveClass && (
            <ClassDetail cls={liveClass} students={students.filter(s => s.classId === liveClass.id)}
              onBack={() => { setSelectedClass(null); setTab('classes') }}
              onSelectStudent={openStudentFromClass}
              onAddStudent={isTeacher ? () => setStudentModal('add') : null}
              onEditClass={isTeacher ? c => setClassModal(c) : null}
              onOpenAttendance={isTeacher ? () => setAttendanceModal(liveClass.id) : null}
              onOpenStarSession={isTeacher ? () => setStarSessionModal(liveClass.id) : null}
              onOpenSpinOfDoom={isTeacher ? () => setSpinModal(liveClass.id) : null}
              onOpenStarSlots={isTeacher ? () => setStarSlotsModal(liveClass.id) : null}
              studentId={isStudent ? access?.student?.id : null}
              completedUnits={isStudent ? (students.find(s => s.id === access?.student?.id)?.unitsCompleted || {}) : {}}
              readOnly={!isTeacher}
            />
          )}

          {tab === 'students' && (
            <><StatsBar students={students} classes={classes} />
            <StudentsView students={students} classes={classes} onSelectStudent={openStudentFromList}
              onAddStudent={isTeacher ? () => setStudentModal('add') : null}
              onEditStudent={isTeacher ? s => setStudentModal(s) : null}
              readOnly={!isTeacher}
            /></>
          )}

          {tab === 'studentProfile' && liveStudent && (
            <StudentProfile student={liveStudent} classes={classes}
              onBack={handleBackFromStudent}
              onEdit={isTeacher ? () => setStudentModal(liveStudent) : null}
              onAddNote={isTeacher ? () => setNoteModal(liveStudent.id) : null}
              onDelete={isTeacher ? handleDeleteStudent : null}
              onAddStars={isTeacher ? handleAwardStars : null}
              onDeleteStar={isTeacher ? handleDeleteStar : null}
              readOnly={!isTeacher}
            />
          )}

          {tab === 'analytics' && (
            <><StatsBar students={students} classes={classes} />
            <AnalyticsView students={students} classes={classes} /></>
          )}

          {tab === 'academy' && isTeacher && (
            <TeacherAcademy />
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

      {/* Modals — teacher only, hard-gated */}
      {isTeacher && classModal       && <ClassModal cls={classModal === 'add' ? null : classModal} onSave={handleSaveClass} onClose={() => setClassModal(null)} />}
      {isTeacher && studentModal     && <StudentModal student={studentModal === 'add' ? null : studentModal} classes={classes} onSave={handleSaveStudent} onClose={() => setStudentModal(null)} />}
      {isTeacher && noteModal        && <NoteModal studentName={students.find(s => s.id === noteModal)?.nameEn || ''} onSave={handleAddNote} onClose={() => setNoteModal(null)} />}
      {isTeacher && attendanceModal  && <AttendanceModal cls={classes.find(c => c.id === attendanceModal)} students={students.filter(s => s.classId === attendanceModal)} onSave={handleSaveAttendance} onClose={() => setAttendanceModal(null)} readOnly={false} />}
      {isTeacher && starSessionModal && <StarSessionModal cls={classes.find(c => c.id === starSessionModal)} students={students.filter(s => s.classId === starSessionModal)} onSave={handleSaveStarSession} onClose={() => setStarSessionModal(null)} readOnly={false} />}
      {isTeacher && spinModal        && <SpinOfDoomModal cls={classes.find(c => c.id === spinModal)} students={students.filter(s => s.classId === spinModal)} onAwardStars={handleAwardStars} onClose={() => setSpinModal(null)} readOnly={false} />}
      {isTeacher && starSlotsModal   && <StarSlotsModal cls={classes.find(c => c.id === starSlotsModal)} students={students.filter(s => s.classId === starSlotsModal)} onAwardStars={handleAwardStars} onClose={() => setStarSlotsModal(null)} readOnly={false} />}
    </div>
  )
}
