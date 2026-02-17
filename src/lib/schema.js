/**
 * Standardized analysis entry schema.
 * Ensures every saved history entry has these fields (even if empty).
 */

const DEFAULT_OTHER_SKILLS = ['Communication', 'Problem solving', 'Basic coding', 'Projects']

const EMPTY_EXTRACTED_SKILLS = {
  coreCS: [],
  languages: [],
  web: [],
  data: [],
  cloud: [],
  testing: [],
  other: [],
}

function ensureArray(val) {
  if (Array.isArray(val)) return val
  return []
}

function ensureObject(val) {
  if (val && typeof val === 'object' && !Array.isArray(val)) return val
  return {}
}

/**
 * Normalize extractedSkills to canonical format.
 * Accepts old format (byCategory, tagsByCategory) or new format.
 */
export function normalizeExtractedSkills(raw = {}) {
  const byCat = raw.byCategory ?? ensureObject(raw)
  const hasNewFormat =
    Array.isArray(raw.coreCS) ||
    Array.isArray(raw.languages) ||
    Array.isArray(raw.web) ||
    Array.isArray(raw.data) ||
    Array.isArray(raw.cloud) ||
    Array.isArray(raw.testing) ||
    Array.isArray(raw.other)

  if (hasNewFormat) {
    return {
      coreCS: ensureArray(raw.coreCS),
      languages: ensureArray(raw.languages),
      web: ensureArray(raw.web),
      data: ensureArray(raw.data),
      cloud: ensureArray(raw.cloud ?? raw.cloudDevOps),
      testing: ensureArray(raw.testing),
      other: ensureArray(raw.other).length ? ensureArray(raw.other) : DEFAULT_OTHER_SKILLS,
    }
  }

  return {
    coreCS: ensureArray(byCat.coreCS),
    languages: ensureArray(byCat.languages),
    web: ensureArray(byCat.web),
    data: ensureArray(byCat.data),
    cloud: ensureArray(byCat.cloudDevOps ?? byCat.cloud),
    testing: ensureArray(byCat.testing),
    other: (() => {
      const arr = ensureArray(byCat.other ?? byCat.general)
      if (arr.length === 0) return DEFAULT_OTHER_SKILLS
      if (arr.length === 1 && arr[0] === 'General fresher stack') return DEFAULT_OTHER_SKILLS
      return arr
    })(),
  }
}

/**
 * Build tagsByCategory from canonical extractedSkills (for UI display).
 */
export function buildTagsByCategory(extractedSkills) {
  const es = normalizeExtractedSkills(extractedSkills)
  const out = {}
  if (es.coreCS.length) out['Core CS'] = es.coreCS
  if (es.languages.length) out['Languages'] = es.languages
  if (es.web.length) out['Web'] = es.web
  if (es.data.length) out['Data'] = es.data
  if (es.cloud.length) out['Cloud/DevOps'] = es.cloud
  if (es.testing.length) out['Testing'] = es.testing
  if (es.other.length) out['Other'] = es.other
  return out
}

/**
 * Normalize round mapping to canonical { roundTitle, focusAreas[], whyItMatters }.
 */
function normalizeRoundMapping(raw = []) {
  const arr = Array.isArray(raw) ? raw : []
  return arr.map((r) => ({
    roundTitle: r.roundTitle ?? r.name ?? '',
    focusAreas: Array.isArray(r.focusAreas) ? r.focusAreas : (r.focus ? [r.focus] : []),
    whyItMatters: r.whyItMatters ?? r.whyMatters ?? '',
  }))
}

/**
 * Normalize checklist to canonical { roundTitle, items[] }.
 */
function normalizeChecklist(raw = []) {
  const arr = Array.isArray(raw) ? raw : []
  return arr.map((r) => ({
    roundTitle: r.roundTitle ?? r.name ?? '',
    items: ensureArray(r.items),
  }))
}

/**
 * Normalize 7-day plan to canonical { day, focus, tasks[] }.
 */
function normalizePlan7Days(raw = []) {
  const arr = Array.isArray(raw) ? raw : []
  return arr.map((p) => ({
    day: p.day ?? 0,
    focus: p.focus ?? p.title ?? '',
    tasks: ensureArray(p.tasks),
  }))
}

/**
 * Create empty entry template.
 */
export function createEmptyEntry() {
  const now = new Date().toISOString()
  return {
    id: '',
    createdAt: now,
    company: '',
    role: '',
    jdText: '',
    extractedSkills: { ...EMPTY_EXTRACTED_SKILLS },
    roundMapping: [],
    checklist: [],
    plan7Days: [],
    questions: [],
    baseScore: 0,
    skillConfidenceMap: {},
    finalScore: 0,
    updatedAt: now,
  }
}

/**
 * Normalize any entry (old or new format) to canonical schema.
 * Returns null if entry is too corrupted to recover.
 */
export function normalizeEntry(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw.id
  if (!id && !raw.extractedSkills && !raw.checklist) return null

  const extractedSkills = normalizeExtractedSkills(raw.extractedSkills)
  const tagsByCategory = buildTagsByCategory(extractedSkills)

  const checklistRaw = raw.checklist ?? []
  const planRaw = raw.plan ?? raw.plan7Days ?? []
  const roundMappingRaw = raw.roundMapping ?? raw.companyIntel?.roundMapping ?? []

  const checklist = normalizeChecklist(checklistRaw)
  const plan7Days = normalizePlan7Days(planRaw)
  const roundMapping = normalizeRoundMapping(roundMappingRaw)

  const baseScore = Number(raw.baseScore ?? raw.baseReadinessScore ?? raw.readinessScore) || 0
  const finalScore = Number(raw.finalScore ?? raw.readinessScore ?? baseScore) || 0
  const skillConfidenceMap = ensureObject(raw.skillConfidenceMap)

  return {
    id: id || `analysis_${Date.now()}`,
    createdAt: raw.createdAt || new Date().toISOString(),
    company: typeof raw.company === 'string' ? raw.company : '',
    role: typeof raw.role === 'string' ? raw.role : '',
    jdText: typeof raw.jdText === 'string' ? raw.jdText : '',
    extractedSkills,
    tagsByCategory,
    roundMapping,
    checklist,
    plan7Days,
    plan: plan7Days.map((p) => ({ day: p.day, title: p.focus, tasks: p.tasks })),
    questions: ensureArray(raw.questions),
    baseScore,
    skillConfidenceMap,
    finalScore,
    updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
    companyIntel: raw.companyIntel ?? null,
  }
}

/**
 * Compute finalScore from baseScore and skillConfidenceMap.
 */
export function computeFinalScore(baseScore, skillConfidenceMap, allSkills) {
  if (!allSkills.length) return baseScore
  let knowCount = 0
  for (const s of allSkills) {
    if (skillConfidenceMap[s] === 'know') knowCount++
  }
  const practiceCount = allSkills.length - knowCount
  const adjusted = baseScore + 2 * knowCount - 2 * practiceCount
  return Math.max(0, Math.min(100, Math.round(adjusted)))
}

export { DEFAULT_OTHER_SKILLS }
