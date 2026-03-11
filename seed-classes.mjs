import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "AIzaSyCMLRpRx1SG-WUrjwC3A9m0aSa88NlhKHc",
  authDomain:        "trading-journal-9e805.firebaseapp.com",
  projectId:         "trading-journal-9e805",
  storageBucket:     "trading-journal-9e805.firebasestorage.app",
  messagingSenderId: "70786197774",
  appId:             "1:70786197774:web:3e1f756cda8f4722fa4f5f",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const classes = [
  { name: 'ATB_Pro1_3',   level: 'pro',   day: 'MON', time: '17:30-19:00' },
  { name: 'ATB_Pro5_4',   level: 'pro',   day: 'MON', time: '19:15-20:45' },
  { name: 'HTB_Pro1-2',   level: 'pro',   day: 'TUE', time: '17:30-19:00' },
  { name: 'ATB_Elite3_S', level: 'elite', day: 'TUE', time: '19:15-20:45' },
  { name: 'Pro3_S',       level: 'pro',   day: 'WED', time: '17:30-19:00' },
  { name: 'Elite2_2',     level: 'elite', day: 'WED & SAT', time: '19:15-20:45 / 15:45-17:15' },
  { name: 'HTB_Pro2_2',   level: 'pro',   day: 'THU', time: '17:30-19:00' },
  { name: 'HTB_Pro4-3',   level: 'pro',   day: 'THU', time: '19:15-20:45' },
  { name: 'ATB_Pro5_4',   level: 'pro',   day: 'SAT', time: '17:30-19:00' },
  { name: 'ATB_Elite1_3', level: 'elite', day: 'SAT', time: '19:15-20:45' },
  { name: 'HTB_Pro3_1',   level: 'pro',   day: 'SUN', time: '08:00-09:30' },
  { name: 'HTB_Pro1_2',   level: 'pro',   day: 'SUN', time: '09:30-11:00' },
]

async function seed() {
  console.log('Seeding classes...')
  for (const cls of classes) {
    const doc = await addDoc(collection(db, 'tj_classes'), {
      ...cls,
      students: 0,
      createdAt: serverTimestamp()
    })
    console.log(`✅ Added: ${cls.name} (${doc.id})`)
  }
  console.log('\n🎉 All classes added successfully!')
  process.exit(0)
}

seed().catch(err => { console.error('Error:', err); process.exit(1) })
