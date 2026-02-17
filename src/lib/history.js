import { normalizeEntry, computeFinalScore } from './schema.js'

const STORAGE_KEY = 'placement_prep_history'

function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function setHistory(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    return true
  } catch {
    return false
  }
}

/**
 * Build canonical entry for storage.
 */
function buildCanonicalEntry({ company, role, jdText, ...analysis }) {
  const now = new Date().toISOString()
  const extractedSkills = analysis.extractedSkills ?? {}
  const checklist = analysis.checklist ?? []
  const plan7Days = analysis.plan7Days ?? analysis.plan ?? []
  const roundMapping = analysis.roundMapping ?? analysis.companyIntel?.roundMapping ?? []
  const baseScore = analysis.baseScore ?? analysis.readinessScore ?? 0
  const finalScore = analysis.finalScore ?? baseScore

  return {
    id: `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now,
    company: typeof company === 'string' ? company : '',
    role: typeof role === 'string' ? role : '',
    jdText: typeof jdText === 'string' ? jdText : '',
    extractedSkills: {
      coreCS: extractedSkills.coreCS ?? [],
      languages: extractedSkills.languages ?? [],
      web: extractedSkills.web ?? [],
      data: extractedSkills.data ?? [],
      cloud: extractedSkills.cloud ?? extractedSkills.cloudDevOps ?? [],
      testing: extractedSkills.testing ?? [],
      other: extractedSkills.other ?? [],
      byCategory: extractedSkills.byCategory,
      tagsByCategory: extractedSkills.tagsByCategory,
    },
    roundMapping,
    checklist,
    plan7Days,
    plan: plan7Days,
    questions: Array.isArray(analysis.questions) ? analysis.questions : [],
    baseScore: Math.round(baseScore),
    skillConfidenceMap: analysis.skillConfidenceMap ?? {},
    finalScore: Math.round(finalScore),
    updatedAt: now,
    companyIntel: analysis.companyIntel ?? null,
  }
}

export function saveAnalysis({ company, role, jdText, ...analysis }) {
  const entries = getHistory()
  const entry = buildCanonicalEntry({ company, role, jdText, ...analysis })
  entries.unshift(entry)
  setHistory(entries)
  return entry.id
}

export function getAnalysisById(id) {
  const entries = getHistory()
  const raw = entries.find((e) => e && e.id === id) ?? null
  if (!raw) return null
  const normalized = normalizeEntry(raw)
  return normalized
}

export function getLatestAnalysis() {
  const entries = getHistory()
  const raw = entries[0] ?? null
  if (!raw) return null
  return normalizeEntry(raw)
}

/**
 * GetAllHistory with corruption handling.
 * Returns { entries: Entry[], corruptedCount: number }
 */
function getAllHistoryInternal() {
  const raw = getHistory()
  const entries = []
  let corruptedCount = 0
  for (const item of raw) {
    try {
      const normalized = normalizeEntry(item)
      if (normalized && normalized.id) {
        entries.push(normalized)
      } else {
        corruptedCount++
      }
    } catch {
      corruptedCount++
    }
  }
  return { entries, corruptedCount }
}

export function getAllHistory() {
  return getAllHistoryInternal().entries
}

export function getHistoryWithCorruptionInfo() {
  return getAllHistoryInternal()
}

/**
 * Update an existing analysis entry.
 * On skill toggle: update skillConfidenceMap, finalScore, updatedAt.
 */
export function updateAnalysis(id, updates) {
  const entries = getHistory()
  const idx = entries.findIndex((e) => e && e.id === id)
  if (idx === -1) return false

  const raw = entries[idx]
  const merged = { ...raw, ...updates }

  if (updates.skillConfidenceMap !== undefined) {
    const allSkills = getAllSkillsFromEntry(merged)
    merged.finalScore = computeFinalScore(
      merged.baseScore ?? merged.baseReadinessScore ?? merged.readinessScore ?? 0,
      updates.skillConfidenceMap,
      allSkills
    )
  }
  merged.updatedAt = new Date().toISOString()

  entries[idx] = merged
  setHistory(entries)
  return true
}

function getAllSkillsFromEntry(entry) {
  const es = entry.extractedSkills ?? {}
  if (es.tagsByCategory) {
    const skills = []
    for (const tags of Object.values(es.tagsByCategory)) {
      for (const t of Array.isArray(tags) ? tags : []) skills.push(t)
    }
    return [...new Set(skills)]
  }
  const categories = ['coreCS', 'languages', 'web', 'data', 'cloud', 'testing', 'other']
  const skills = []
  for (const c of categories) {
    for (const t of Array.isArray(es[c]) ? es[c] : []) skills.push(t)
  }
  return [...new Set(skills)]
}
