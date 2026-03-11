import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy
} from 'firebase/firestore'

export function useStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'tj_students'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  async function addStudent(data) {
    await addDoc(collection(db, 'tj_students'), {
      ...data,
      speaking: 0, listening: 0, reading: 0,
      writing: 0, grammar: 0, vocabulary: 0,
      attendance: 100,
      goal: 'On track',
      notes: [],
      createdAt: serverTimestamp()
    })
  }

  async function updateStudent(id, data) {
    await updateDoc(doc(db, 'tj_students', id), data)
  }

  async function deleteStudent(id) {
    await deleteDoc(doc(db, 'tj_students', id))
  }

  return { students, loading, addStudent, updateStudent, deleteStudent }
}
