import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy
} from 'firebase/firestore'

export function useClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'tj_classes'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  async function addClass(data) {
    await addDoc(collection(db, 'tj_classes'), { ...data, createdAt: serverTimestamp() })
  }

  async function updateClass(id, data) {
    await updateDoc(doc(db, 'tj_classes', id), data)
  }

  async function deleteClass(id) {
    await deleteDoc(doc(db, 'tj_classes', id))
  }

  return { classes, loading, addClass, updateClass, deleteClass }
}
