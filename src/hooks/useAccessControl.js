import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { DEFAULT_ACCESS_CONFIG, CONTROLLABLE_ROLES } from '../lib/accessControl'

const DOC_REF_PATH = ['tj_settings', 'accessControl']

// Deep-merge saved config over the defaults, so new fields added later
// (new tabs/features) always have a sane fallback even for old saved docs.
function mergeWithDefaults(saved) {
  const merged = {}
  for (const role of CONTROLLABLE_ROLES) {
    const def = DEFAULT_ACCESS_CONFIG[role]
    const sv  = saved?.[role] || {}
    merged[role] = {
      tabs:         { ...def.tabs,     ...(sv.tabs || {}) },
      features:     { ...def.features, ...(sv.features || {}) },
      lockMessages: { ...(sv.lockMessages || {}) },
      classFilter:  Array.isArray(sv.classFilter) ? sv.classFilter : [],
      demoBanner:   sv.demoBanner !== undefined ? sv.demoBanner : true,
    }
  }
  return merged
}

export function useAccessControl() {
  const [config, setConfig] = useState(DEFAULT_ACCESS_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ref = doc(db, ...DOC_REF_PATH)
    const unsub = onSnapshot(ref, snap => {
      setConfig(mergeWithDefaults(snap.exists() ? snap.data() : null))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  // Shallow-patch a single role's config, e.g. updateRoleConfig('parent', { tabs: {...} })
  async function updateRoleConfig(role, patch) {
    const ref = doc(db, ...DOC_REF_PATH)
    const next = {
      ...config[role],
      ...patch,
      tabs:         { ...config[role].tabs,     ...(patch.tabs || {}) },
      features:     { ...config[role].features, ...(patch.features || {}) },
      lockMessages: { ...config[role].lockMessages, ...(patch.lockMessages || {}) },
    }
    setConfig(prev => ({ ...prev, [role]: next }))
    await setDoc(ref, { [role]: next }, { merge: true })
  }

  return { config, loading, updateRoleConfig }
}
