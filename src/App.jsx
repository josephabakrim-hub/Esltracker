import { useState } from 'react'
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
import { useClasses } from './hooks/useClasses'
import { useStudents } from './hooks/useStudents'

export default function App() {
  const { classes, loading: loadingClasses, addClass, updateClass, deleteClass } = useClasses()
  const { students, loading: loadingStudents, addStudent, updateStudent, deleteStudent } = useStudents()

  const [tab, setTab] = useState('classes')
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Modals
  const [classModal, setClassModal] = useState(null)   // null | 'add' | {classObj}
  const [studentModal, setStudentModal] = useState(null) // null | 'add' | {studentObj}
  const [noteModal, setNoteModal] = useState(null)      // null | studentId

  // Always keep selectedClass/Student in sync with live data
  const liveClass   = selectedClass   ? classes.find(c => c.id === selectedClass.id)   || selectedClass   : null
  const liveStudent = selectedStudent ? students.find(s => s.id === selectedStudent.id) || selectedStudent : null

  // ── CLASS ACTIONS ──
  async function handleSaveClass(data) {
    if (classModal && classModal.id) {
      await updateClass(classModal.id, data)
      if (selectedClass?.id === classModal.id) setSelectedClass(prev => ({ ...prev, ...data }))
    } else {
      await addClass(data)
    }
    setClassModal(null)
  }

  async function handleDeleteClass(id) {
    await deleteClass(id)
    if (selectedClass?.id === id) setSelectedClass(null)
  }

  // ── STUDENT ACTIONS ──
  async function handleSaveStudent(data) {
    if (studentModal && studentModal.id) {
      await updateStudent(studentModal.id, data)
    } else {
      await addStudent(data)
    }
    setStudentModal(null)
  }

  async function handleDeleteStudent(id) {
    await deleteStudent(id)
    setSelectedStudent(null)
    setTab('students')
  }

  async function handleAddNote(text) {
    const s = students.find(st => st.id === noteModal)
    if (!s) return
    const notes = [...(s.notes || []), {
      date: new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }),
      text
    }]
    await updateStudent(noteModal, { notes })
    setNoteModal(null)
  }

  // ── NAVIGATION ──
  function openClass(cls) {
    setSelectedClass(cls)
    setTab('classDetail')
  }
  function openStudent(student) {
    setSelectedStudent(student)
    setTab('studentProfile')
  }

  const isLoading = loadingClasses || loadingStudents

  const activeTab = ['classDetail','studentProfile'].includes(tab) ? tab.startsWith('class') ? 'classes' : 'students' : tab

  function handleTabChange(t) {
    setSelectedClass(null)
    setSelectedStudent(null)
    setTab(t)
  }

  return (
    <div>
      <Header
        onAddClass={() => setClassModal('add')}
        onAddStudent={() => setStudentModal('add')}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
        <Tabs active={activeTab} onChange={handleTabChange} />

        {isLoading && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>
            Loading...
          </div>
        )}

        {!isLoading && <>
          {/* CLASSES TAB */}
          {tab === 'classes' && (
            <>
              <StatsBar students={students} classes={classes} />
              <ClassesView
                classes={classes} students={students}
                onSelectClass={openClass}
                onAddClass={() => setClassModal('add')}
                onEditClass={c => setClassModal(c)}
                onDeleteClass={handleDeleteClass}
              />
            </>
          )}

          {/* CLASS DETAIL */}
          {tab === 'classDetail' && liveClass && (
            <ClassDetail
              cls={liveClass}
              students={students.filter(s => s.classId === liveClass.id)}
              onBack={() => { setSelectedClass(null); setTab('classes') }}
              onSelectStudent={openStudent}
              onAddStudent={() => setStudentModal('add')}
              onEditClass={c => setClassModal(c)}
            />
          )}

          {/* STUDENTS TAB */}
          {tab === 'students' && (
            <>
              <StatsBar students={students} classes={classes} />
              <StudentsView
                students={students} classes={classes}
                onSelectStudent={openStudent}
                onAddStudent={() => setStudentModal('add')}
                onEditStudent={s => setStudentModal(s)}
              />
            </>
          )}

          {/* STUDENT PROFILE */}
          {tab === 'studentProfile' && liveStudent && (
            <StudentProfile
              student={liveStudent}
              classes={classes}
              onBack={() => { setSelectedStudent(null); setTab('students') }}
              onEdit={() => setStudentModal(liveStudent)}
              onAddNote={() => setNoteModal(liveStudent.id)}
              onDelete={handleDeleteStudent}
            />
          )}

          {/* ANALYTICS TAB */}
          {tab === 'analytics' && (
            <>
              <StatsBar students={students} classes={classes} />
              <AnalyticsView students={students} classes={classes} />
            </>
          )}
        </>}
      </div>

      {/* MODALS */}
      {classModal && (
        <ClassModal
          cls={classModal === 'add' ? null : classModal}
          onSave={handleSaveClass}
          onClose={() => setClassModal(null)}
        />
      )}

      {studentModal && (
        <StudentModal
          student={studentModal === 'add' ? null : studentModal}
          classes={classes}
          onSave={handleSaveStudent}
          onClose={() => setStudentModal(null)}
        />
      )}

      {noteModal && (
        <NoteModal
          studentName={students.find(s => s.id === noteModal)?.nameEn || ''}
          onSave={handleAddNote}
          onClose={() => setNoteModal(null)}
        />
      )}
    </div>
  )
}
