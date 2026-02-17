import { useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { getAnalysisById, getLatestAnalysis, updateAnalysis } from '../lib/history'
import { generateCompanyIntel } from '../lib/companyIntel'
import { Calendar, ListChecks, HelpCircle, Tag, Copy, Download, ArrowRight, Building2, Info } from 'lucide-react'

function getAllSkills(tagsByCategory) {
  const skills = []
  for (const tags of Object.values(tagsByCategory || {})) {
    for (const tag of Array.isArray(tags) ? tags : []) {
      skills.push(tag)
    }
  }
  return [...new Set(skills)]
}

function computeLiveScore(baseScore, skillConfidenceMap, allSkills) {
  if (!allSkills.length) return baseScore
  let knowCount = 0
  for (const skill of allSkills) {
    if (skillConfidenceMap[skill] === 'know') knowCount++
  }
  const practiceCount = allSkills.length - knowCount
  const adjusted = baseScore + 2 * knowCount - 2 * practiceCount
  return Math.max(0, Math.min(100, adjusted))
}

function formatSevenDayPlan(plan) {
  if (!plan?.length) return ''
  return plan
    .map((day) => `${day.title ?? day.focus ?? ''}\n${(day.tasks || []).map((t) => `  • ${t}`).join('\n')}`)
    .join('\n\n')
}

function formatChecklist(checklist) {
  if (!checklist?.length) return ''
  return checklist
    .map((round) => `${round.roundTitle ?? round.name ?? ''}\n${(round.items || []).map((i) => `  • ${i}`).join('\n')}`)
    .join('\n\n')
}

function formatQuestions(questions) {
  if (!questions?.length) return ''
  return questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
}

export default function Results() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const [entry, setEntry] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(null)

  useEffect(() => {
    try {
      const item = id ? getAnalysisById(id) : getLatestAnalysis()
      if (item && typeof item === 'object' && (item.id || item.extractedSkills || item.checklist)) {
        setEntry(item)
      } else if (id) {
        setNotFound(true)
      } else {
        setEntry(null)
      }
    } catch {
      setEntry(null)
      if (id) setNotFound(true)
    }
  }, [id])

  const handleToggleSkill = useCallback(
    (skill, newVal) => {
      if (!entry?.id) return
      const map = { ...(entry.skillConfidenceMap || {}), [skill]: newVal }
      const allSkills = getAllSkills(entry.tagsByCategory ?? entry.extractedSkills?.tagsByCategory ?? {})
      const base = entry.baseScore ?? entry.baseReadinessScore ?? entry.readinessScore ?? 0
      const score = computeLiveScore(base, map, allSkills)
      const updates = {
        skillConfidenceMap: map,
        finalScore: score,
        updatedAt: new Date().toISOString(),
      }
      if (updateAnalysis(entry.id, updates)) {
        setEntry((prev) => (prev ? { ...prev, ...updates } : prev))
      }
    },
    [entry?.id, entry?.tagsByCategory, entry?.extractedSkills, entry?.baseScore]
  )

  const copyToClipboard = useCallback((text, label) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyFeedback(label)
        setTimeout(() => setCopyFeedback(null), 2000)
      })
      .catch(() => setCopyFeedback('Failed'))
  }, [])

  const downloadTxt = useCallback(
    (plan, checklist, questions, company, role) => {
      const header = `Placement Readiness — ${company || 'Job'} ${role ? `· ${role}` : ''}\n${'='.repeat(50)}\n\n`
      const sections = [
        ['7-DAY PLAN', formatSevenDayPlan(plan)],
        ['ROUND-WISE CHECKLIST', formatChecklist(checklist)],
        ['10 LIKELY INTERVIEW QUESTIONS', formatQuestions(questions)],
      ]
      const body = sections.map(([title, content]) => `## ${title}\n\n${content}\n`).join('\n')
      const blob = new Blob([header + body], { type: 'text/plain' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `placement-readiness-${Date.now()}.txt`
      a.click()
      URL.revokeObjectURL(a.href)
    },
    []
  )

  if (notFound) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Results</h2>
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            This analysis could not be found. It may have been cleared. Run a new analysis from Analyze JD.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Results</h2>
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            No analysis yet. Go to Analyze JD and paste a job description to see results here.
          </CardContent>
        </Card>
      </div>
    )
  }

  const { company, role, createdAt, extractedSkills, tagsByCategory: tagsByCat, checklist, plan, questions } = entry
  const tagsByCategory = tagsByCat ?? extractedSkills?.tagsByCategory ?? {}
  const allSkills = getAllSkills(tagsByCategory)
  const skillConfidenceMap = entry.skillConfidenceMap || {}
  const baseScore = entry.baseScore ?? entry.baseReadinessScore ?? entry.readinessScore ?? 0
  const hasAnyConfidence = Object.keys(skillConfidenceMap).length > 0
  const liveScore = hasAnyConfidence
    ? computeLiveScore(baseScore, skillConfidenceMap, allSkills)
    : (entry.finalScore ?? entry.readinessScore ?? 0)

  const weakSkills = allSkills
    .filter((s) => skillConfidenceMap[s] !== 'know')
    .slice(0, 3)

  const companyIntel = useMemo(() => {
    if (entry.companyIntel) return entry.companyIntel
    if (!entry.company?.trim()) return null
    try {
      return generateCompanyIntel({
        company: entry.company,
        jdText: entry.jdText || '',
        extractedSkills: entry.extractedSkills || {},
      })
    } catch {
      return null
    }
  }, [entry?.company, entry?.companyIntel, entry?.jdText, entry?.extractedSkills])

  useEffect(() => {
    if (companyIntel && !entry.companyIntel && entry.id) {
      updateAnalysis(entry.id, { companyIntel })
      setEntry((prev) => (prev ? { ...prev, companyIntel } : prev))
    }
  }, [companyIntel, entry?.companyIntel, entry?.id])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Analysis Results</h2>
          <p className="text-gray-600 text-sm">
            {company && `${company}${role ? ' · ' : ''}`}
            {role && role}
            {!company && !role && 'Job description analysis'}
            {' · '}
            {createdAt ? new Date(createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Readiness</span>
          <span className="text-2xl font-bold text-primary">{liveScore}</span>
          <span className="text-sm text-gray-500">/ 100</span>
        </div>
      </div>

      {/* Company Intel — only when company provided */}
      {companyIntel && typeof companyIntel === 'object' && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Company Intel
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Demo Mode: Company intel generated heuristically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company</p>
                <p className="text-lg font-semibold text-gray-900">{companyIntel.company}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Industry</p>
                <p className="text-base font-medium text-gray-700">{companyIntel.industry}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Est. Size</p>
                <p className="text-base font-medium text-gray-700">{companyIntel.sizeLabel}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Typical Hiring Focus</p>
              <p className="text-sm text-gray-700 leading-relaxed">{companyIntel.hiringFocus}</p>
            </div>

            {/* Round Mapping — vertical timeline */}
            {Array.isArray(companyIntel.roundMapping) && companyIntel.roundMapping.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Expected Round Flow</p>
              <div className="relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" aria-hidden="true" />
                <ul className="space-y-4">
                  {companyIntel.roundMapping.map((round, i) => (
                    <li key={i} className="relative flex gap-4 pl-1">
                      <span
                        className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-sm shrink-0"
                        aria-hidden="true"
                      />
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium text-gray-900">{round?.name ?? ''}</p>
                        <p className="text-sm text-primary font-medium">{round?.focus ?? ''}</p>
                        <p className="text-xs text-gray-500 mt-1.5 italic">Why this round matters: {round?.whyMatters ?? ''}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key skills extracted */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Key skills extracted
            </CardTitle>
            <CardDescription>Toggle your confidence. Updates readiness score in real time.</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(tagsByCategory).length === 0 ? (
              <p className="text-sm text-gray-500">General fresher stack (no specific keywords detected).</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(tagsByCategory || {}).map(([category, tags]) =>
                  (Array.isArray(tags) ? tags : []).map((tag) => {
                    const status = skillConfidenceMap[tag] || 'practice'
                    const isKnow = status === 'know'
                    return (
                      <div
                        key={`${category}-${tag}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white overflow-hidden"
                      >
                        <span
                          className={`px-2.5 py-1 text-sm font-medium ${
                            isKnow ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {tag}
                        </span>
                        <div className="flex border-l border-gray-200">
                          <button
                            type="button"
                            onClick={() => handleToggleSkill(tag, 'know')}
                            className={`px-2 py-0.5 text-xs font-medium transition-colors ${
                              isKnow ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title="I know this"
                          >
                            I know
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleSkill(tag, 'practice')}
                            className={`px-2 py-0.5 text-xs font-medium transition-colors ${
                              !isKnow ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title="Need practice"
                          >
                            Practice
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Round-wise checklist */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-primary" />
                Round-wise preparation
              </CardTitle>
              <button
                type="button"
                onClick={() => copyToClipboard(formatChecklist(checklist), 'Checklist')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy round checklist
              </button>
            </div>
            <CardDescription>Checklist by round</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[320px] overflow-y-auto">
            {(checklist || []).filter(Boolean).map((round, idx) => (
              <div key={round?.roundTitle ?? round?.name ?? idx}>
                <p className="font-medium text-gray-900 text-sm mb-2">{round?.roundTitle ?? round?.name ?? ''}</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {(round.items || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 7-day plan */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                7-day plan
              </CardTitle>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(formatSevenDayPlan(plan), '7-day plan')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy 7-day plan
                </button>
              </div>
            </div>
            <CardDescription>Adapted to detected skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {(plan || []).filter(Boolean).map((day, idx) => (
                <div key={day?.day ?? idx} className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                  <p className="font-medium text-gray-900 text-sm mb-2">{day?.title ?? day?.focus ?? ''}</p>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                    {(day.tasks || []).map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 10 likely questions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                10 likely interview questions
              </CardTitle>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(formatQuestions(questions), '10 questions')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy 10 questions
                </button>
              </div>
            </div>
            <CardDescription>Based on detected skills</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              {(questions || []).map((q, i) => (
                <li key={i} className="pl-1">{q}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Export bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => downloadTxt(plan, checklist, questions, company, role)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4" />
          Download as TXT
        </button>
        {copyFeedback && (
          <span className="text-sm text-emerald-600 font-medium">{copyFeedback} copied!</span>
        )}
      </div>

      {/* Action Next box */}
      {weakSkills.length > 0 && (
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardHeader>
            <CardTitle className="text-lg">Action Next</CardTitle>
            <CardDescription>Focus areas and suggested next step</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Top 3 skills to practice</p>
              <div className="flex flex-wrap gap-2">
                {weakSkills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-md bg-amber-100 px-2.5 py-0.5 text-sm font-medium text-amber-800"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 p-3">
              <ArrowRight className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm font-medium text-gray-900">Start Day 1 plan now.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
