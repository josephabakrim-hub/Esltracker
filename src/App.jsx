import { useState, useEffect } from 'react'
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
import LessonsHub from './components/LessonsHub'
import StudentPortal from './components/StudentPortal'
import { useClasses } from './hooks/useClasses'
import { useStudents } from './hooks/useStudents'

export default function App() {
  const { classes, loading: loadingClasses, addClass, updateClass, deleteClass } = useClasses()
  const { students, loading: loadingStudents, addStudent, updateStudent, deleteStudent } = useStudents()

  const [access, setAccess] = useState(null)

  // Only teacher has write access — hard boolean, not just readOnly flag
  const isTeacher = access?.role === 'teacher'
  const isStudent = access?.role === 'student'

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
  const [lessonsHubModal,  setLessonsHubModal]  = useState(null)

  const liveClass   = selectedClass   ? classes.find(c => c.id === selectedClass.id)   || selectedClass   : null
  const liveStudent = selectedStudent ? students.find(s => s.id === selectedStudent.id) || selectedStudent : null

  // ── Teacher-only write handlers ──────────────────────────────────────────
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

  // ── Gate ─────────────────────────────────────────────────────────────────
  if (!access) return <AccessGate onAccess={setAccess} />

  // ── Student portal — completely separate UI, zero access to teacher data ──
  if (isStudent) {
    return (
      <StudentPortal
        student={access.student}
        classes={classes}
        students={students}
        isDark={isDark}
        onToggleTheme={() => setIsDark(d => !d)}
        onLogout={() => setAccess(null)}
      />
    )
  }

  // ── Teacher / parent / colleague dashboard ────────────────────────────────
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
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
        <Tabs active={activeTab} onChange={handleTabChange} />

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
              onOpenLessonsHub={() => setLessonsHubModal(liveClass)}
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
        </>}
      </div>

      {/* Modals — teacher only, every single one gated */}
      {isTeacher && classModal       && <ClassModal cls={classModal === 'add' ? null : classModal} onSave={handleSaveClass} onClose={() => setClassModal(null)} />}
      {isTeacher && studentModal     && <StudentModal student={studentModal === 'add' ? null : studentModal} classes={classes} onSave={handleSaveStudent} onClose={() => setStudentModal(null)} />}
      {isTeacher && noteModal        && <NoteModal studentName={students.find(s => s.id === noteModal)?.nameEn || ''} onSave={handleAddNote} onClose={() => setNoteModal(null)} />}
      {isTeacher && attendanceModal  && <AttendanceModal cls={classes.find(c => c.id === attendanceModal)} students={students.filter(s => s.classId === attendanceModal)} onSave={handleSaveAttendance} onClose={() => setAttendanceModal(null)} readOnly={false} />}
      {isTeacher && starSessionModal && <StarSessionModal cls={classes.find(c => c.id === starSessionModal)} students={students.filter(s => s.classId === starSessionModal)} onSave={handleSaveStarSession} onClose={() => setStarSessionModal(null)} readOnly={false} />}
      {isTeacher && spinModal        && <SpinOfDoomModal cls={classes.find(c => c.id === spinModal)} students={students.filter(s => s.classId === spinModal)} onAwardStars={handleAwardStars} onClose={() => setSpinModal(null)} readOnly={false} />}
      {isTeacher && starSlotsModal   && <StarSlotsModal cls={classes.find(c => c.id === starSlotsModal)} students={students.filter(s => s.classId === starSlotsModal)} onAwardStars={handleAwardStars} onClose={() => setStarSlotsModal(null)} readOnly={false} />}
      {isTeacher && lessonsHubModal  && <LessonsHub cls={lessonsHubModal} onClose={() => setLessonsHubModal(null)} />}
    </div>
  )
}
