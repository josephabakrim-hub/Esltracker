// ── ACCESS CONTROL — constants & helpers ────────────────────────────────────
// Controls what Student / Parent / Colleague roles can see and do.
// Teacher Joseph always has full, unrestricted access — none of this applies to him.

export const CONTROLLABLE_ROLES = ['student', 'parent', 'colleague']

export const ROLE_LABELS = {
  student:   '👨‍🎓 Student',
  parent:    '👨‍👩‍👧 Parent',
  colleague: '🏫 Colleague / Manager',
}

// Tabs a role can be granted access to (Admin tab is never exposed to non-teachers)
export const TABS = [
  { id: 'classes',   label: '🏫 Classes'   },
  { id: 'students',  label: '👤 Students'  },
  { id: 'analytics', label: '📊 Analytics' },
  { id: 'academy',   label: '🎓 Academy'   },
]

// Interactive features a role can be granted access to
export const FEATURES = [
  { id: 'attendance',  label: '📅 Attendance' },
  { id: 'starSession', label: '⭐ Star Session' },
  { id: 'spinOfDoom',  label: '🎰 Spin of Doom' },
  { id: 'starSlots',   label: '🃏 Star Slots' },
  { id: 'notes',       label: '📝 Add Notes' },
]

// Modes ───────────────────────────────────────────────────────────────────
// Tabs:     hidden | blurred | visible
// Features: hidden | demo | live-view
export const TAB_MODES = [
  { id: 'hidden',  label: 'Hidden',       desc: 'Tab does not appear at all' },
  { id: 'blurred', label: 'Blurred lock', desc: 'Tab is visible and clickable, but content is blurred with a lock message' },
  { id: 'visible', label: 'Visible',      desc: 'Full, real access to this tab' },
]
export const FEATURE_MODES = [
  { id: 'hidden',     label: 'Hidden',        desc: 'Button/feature does not appear' },
  { id: 'demo',       label: 'Demo (try it)', desc: 'Fully interactive, but nothing is saved to your real data' },
  { id: 'live-view',  label: 'View only',     desc: 'Can see the real data, but cannot interact or change anything' },
]

export const DEFAULT_LOCK_MESSAGE = 'This is for Teacher Joseph only.'

function defaultRoleConfig() {
  return {
    tabs: { classes: 'visible', students: 'visible', analytics: 'visible', academy: 'hidden' },
    features: { attendance: 'hidden', starSession: 'hidden', spinOfDoom: 'hidden', starSlots: 'hidden', notes: 'hidden' },
    lockMessages: {},   // { [tabId or featureId]: customMessage }
    classFilter: [],    // empty = can see all classes; else restrict to these classIds
    demoBanner: true,   // show a "demo, not saved" indicator inside demo features
  }
}

export const DEFAULT_ACCESS_CONFIG = {
  student:   defaultRoleConfig(),
  parent:    defaultRoleConfig(),
  colleague: defaultRoleConfig(),
}

export function getTabMode(config, role, tabId) {
  if (!config || !config[role]) return 'visible'
  return config[role].tabs?.[tabId] || 'hidden'
}

export function getFeatureMode(config, role, featureId) {
  if (!config || !config[role]) return 'hidden'
  return config[role].features?.[featureId] || 'hidden'
}

export function getLockMessage(config, role, id) {
  const custom = config?.[role]?.lockMessages?.[id]
  return custom && custom.trim() ? custom.trim() : DEFAULT_LOCK_MESSAGE
}

export function getClassFilter(config, role) {
  return config?.[role]?.classFilter || []
}

export function showsDemoBanner(config, role) {
  return config?.[role]?.demoBanner !== false
}
