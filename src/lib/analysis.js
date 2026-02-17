/**
 * JD analysis logic — heuristic skill extraction and output generation.
 * No external APIs. All keywords case-insensitive.
 */

import { generateCompanyIntel } from './companyIntel.js'
import { DEFAULT_OTHER_SKILLS } from './schema.js'

const SKILL_CATEGORIES = {
  coreCS: {
    label: 'Core CS',
    keywords: ['DSA', 'OOP', 'DBMS', 'OS', 'Networks', 'Data Structures', 'Algorithms', 'Operating System', 'Computer Networks'],
  },
  languages: {
    label: 'Languages',
    keywords: ['Java', 'Python', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Golang', 'C programming', 'C/C++'],
  },
  web: {
    label: 'Web',
    keywords: ['React', 'Next.js', 'Node.js', 'Express', 'REST', 'GraphQL', 'Angular', 'Vue', 'HTML', 'CSS'],
  },
  data: {
    label: 'Data',
    keywords: ['SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'NoSQL', 'Database'],
  },
  cloudDevOps: {
    label: 'Cloud/DevOps',
    keywords: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'K8s', 'CI/CD', 'Linux', 'DevOps', 'Terraform'],
  },
  testing: {
    label: 'Testing',
    keywords: ['Selenium', 'Cypress', 'Playwright', 'JUnit', 'PyTest', 'Jest', 'Testing', 'Unit testing'],
  },
}

const CATEGORY_KEYS = Object.keys(SKILL_CATEGORIES)

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Extract skills from JD text (case-insensitive). Returns { byCategory, categoriesPresent }.
 */
export function extractSkills(jdText) {
  if (!jdText || typeof jdText !== 'string') {
    return { byCategory: {}, categoriesPresent: [], tagsByCategory: {} }
  }
  const text = jdText.trim()
  const byCategory = {}
  const tagsByCategory = {}

  for (const key of CATEGORY_KEYS) {
    const { label, keywords } = SKILL_CATEGORIES[key]
    const found = []
    for (const kw of keywords) {
      const re = new RegExp(escapeRegex(kw), 'gi')
      if (re.test(text)) found.push(kw)
    }
    if (found.length) {
      byCategory[key] = [...new Set(found)]
      tagsByCategory[label] = byCategory[key]
    }
  }

  const categoriesPresent = Object.keys(byCategory)
  if (categoriesPresent.length === 0) {
    byCategory.other = [...DEFAULT_OTHER_SKILLS]
    tagsByCategory['Other'] = byCategory.other
  }

  return { byCategory, categoriesPresent, tagsByCategory }
}

/**
 * Convert byCategory to canonical extractedSkills format.
 */
function toCanonicalExtractedSkills(byCategory) {
  return {
    coreCS: byCategory.coreCS ?? [],
    languages: byCategory.languages ?? [],
    web: byCategory.web ?? [],
    data: byCategory.data ?? [],
    cloud: byCategory.cloudDevOps ?? [],
    testing: byCategory.testing ?? [],
    other: byCategory.other ?? byCategory.general ?? (Object.keys(byCategory).length === 0 ? [...DEFAULT_OTHER_SKILLS] : []),
  }
}

/**
 * Round-wise preparation checklist. 4 rounds, 5–8 items each based on detected skills.
 * Returns canonical format: { roundTitle, items[] }.
 */
export function buildChecklist(byCategory, categoriesPresent) {
  const has = (k) => byCategory[k]?.length > 0
  const rounds = [
    {
      name: 'Round 1: Aptitude / Basics',
      items: [
        'Revise quantitative aptitude: percentages, ratios, time-speed-distance.',
        'Practice logical reasoning and pattern recognition.',
        'Review verbal ability and reading comprehension.',
        'Time yourself on mock aptitude tests.',
        'Brush up basic grammar and vocabulary.',
        'Practice data interpretation from tables and graphs.',
        'Do at least 2 full-length aptitude mocks.',
      ],
    },
    {
      name: 'Round 2: DSA + Core CS',
      items: [
        ...(has('coreCS') ? [
          'Revise core DSA: arrays, strings, linked lists, trees, graphs.',
          'Practice 2–3 problems daily on arrays and two pointers.',
          'Revise OOP concepts: encapsulation, inheritance, polymorphism.',
          'Brush up DBMS: normalization, ACID, indexing, transactions.',
          'Review OS: processes, threads, scheduling, memory.',
          'Revise basics of computer networks: TCP/IP, HTTP, DNS.',
        ] : [
          'Revise basic data structures: arrays, strings, hash maps.',
          'Practice simple coding problems (loops, conditions).',
          'Brush up basic CS fundamentals from your curriculum.',
        ]),
        'Practice explaining your approach before coding.',
        'Time yourself on 2–3 coding problems.',
      ].slice(0, 8),
    },
    {
      name: 'Round 3: Tech interview (projects + stack)',
      items: [
        ...(has('languages') ? ['Prepare to explain your strongest language (syntax, memory, best practices).'] : []),
        ...(has('web') ? [
          'Prepare project deep-dive: architecture, your role, challenges.',
          'Revise React/Vue/Angular concepts if you used them.',
          'Be ready to explain REST/APIs and state management.',
        ] : []),
        ...(has('data') ? ['Prepare SQL: joins, subqueries, indexing. Be ready to write queries.'] : []),
        ...(has('cloudDevOps') ? ['Revise cloud/DevOps basics if mentioned (e.g. Docker, CI/CD).'] : []),
        ...(has('testing') ? ['Prepare testing approach: unit, integration, tools you used.'] : []),
        'List 2–3 projects with STAR-style answers.',
        'Align resume bullet points with JD keywords.',
      ].filter(Boolean).slice(0, 8),
    },
    {
      name: 'Round 4: Managerial / HR',
      items: [
        'Prepare "Tell me about yourself" (2 min).',
        'Prepare "Why this company?" and "Why this role?".',
        'List 3 strengths and 1 weakness with improvement story.',
        'Prepare situational examples: conflict, deadline, failure.',
        'Research company culture and recent news.',
        'Prepare questions to ask the interviewer.',
        'Practice confidence and clarity in communication.',
      ],
    },
  ]
  return rounds.map((r) => ({
    roundTitle: r.name,
    items: r.items.slice(0, 8),
  }))
}

/**
 * 7-day plan. Template-based, adapted to detected skills.
 */
export function buildSevenDayPlan(byCategory, categoriesPresent) {
  const has = (k) => byCategory[k]?.length > 0
  const hasWeb = has('web')
  const hasDSA = has('coreCS')
  const hasData = has('data')

  const base = [
    { day: 1, title: 'Day 1: Basics + Core CS', tasks: ['Aptitude: ratios, percentages, reasoning.', 'Core CS: OOP, DBMS basics.', 'Review OS and Networks fundamentals.'] },
    { day: 2, title: 'Day 2: Core CS continued', tasks: ['Complete core CS revision (DBMS, OS, Networks).', 'Start DSA: arrays and strings.', 'Solve 3–5 easy array/string problems.'] },
    { day: 3, title: 'Day 3: DSA + Coding', tasks: ['DSA: trees and graphs basics.', 'Practice 2 tree/graph problems.', 'Revise time/space complexity.'] },
    { day: 4, title: 'Day 4: DSA practice', tasks: ['Mixed DSA: stacks, queues, hashing.', '2–3 medium problems.', 'Practice explaining approach aloud.'] },
    { day: 5, title: 'Day 5: Project + Resume', tasks: ['Document 2 projects with impact and tech stack.', 'Align resume bullets with JD.', 'Prepare 1-min project pitch.'] },
    { day: 6, title: 'Day 6: Mock interview Qs', tasks: ['Practice 10 behavioral questions.', 'Do 1 mock technical (coding + theory).', 'Record and review one answer.'] },
    { day: 7, title: 'Day 7: Revision + Weak areas', tasks: ['Revise weak topics from the week.', 'Light revision: no new topics.', 'Rest and stay confident.'] },
  ]

  if (hasWeb) {
    base[4].tasks.push('Frontend: Revise React/state management if applicable.')
    base[5].tasks.push('Prepare frontend-specific questions (e.g. virtual DOM, hooks).')
  }
  if (hasData) {
    base[1].tasks.push('SQL: joins, aggregation, indexing.')
    base[5].tasks.push('Prepare DB design and query optimization answers.')
  }
  if (hasDSA) {
    base[2].tasks.push('Focus on frequently asked DSA patterns (e.g. two pointers, sliding window).')
  }

  return base.map((d) => ({
    day: d.day,
    focus: d.title,
    tasks: d.tasks,
  }))
}

/**
 * Generate 10 likely interview questions based on detected skills.
 */
export function generateQuestions(byCategory) {
  const has = (k) => byCategory[k]?.length > 0
  const q = []

  if (has('data')) {
    q.push('Explain indexing in databases and when it helps.')
    q.push('What is the difference between SQL and NoSQL? When would you choose each?')
  }
  if (has('web')) {
    q.push('Explain state management options in React (useState, Context, Redux).')
    q.push('How does the virtual DOM work and why is it used?')
  }
  if (has('coreCS')) {
    q.push('How would you optimize search in sorted data? (Binary search and variants.)')
    q.push('Explain time complexity of common operations on arrays vs linked lists.')
    q.push('Describe a project where you used OOP effectively.')
  }
  if (has('languages')) {
    q.push('Explain pass-by-value vs pass-by-reference in your primary language.')
    q.push('How do you handle memory management / garbage collection?')
  }
  if (has('cloudDevOps')) {
    q.push('Explain what Docker does and how it differs from a VM.')
    q.push('What is CI/CD and how have you used it?')
  }
  if (has('testing')) {
    q.push('How do you approach unit testing? What do you mock and why?')
  }

  q.push('Tell me about a challenging bug you fixed and how you approached it.')
  q.push('How do you prioritize when you have multiple deadlines?')
  if (has('other') || Object.keys(byCategory).length === 0 || (byCategory.other?.length ?? 0) > 0) {
    q.push('How do you approach a problem you have never seen before?')
    q.push('Describe a project where you collaborated with others.')
  }

  return q.slice(0, 10)
}

/**
 * Readiness score 0–100.
 * Start 35, +5 per category (max 30), +10 company, +10 role, +10 JD length > 800. Cap 100.
 */
export function computeReadinessScore({ jdText = '', company = '', role = '', categoriesPresent = [] }) {
  let score = 35
  const categoryBonus = Math.min(categoriesPresent.length * 5, 30)
  score += categoryBonus
  if (company.trim().length > 0) score += 10
  if (role.trim().length > 0) score += 10
  if (jdText.length > 800) score += 10
  return Math.min(100, Math.max(0, score))
}

/**
 * Run full analysis. Returns object ready to store.
 */
export function runAnalysis({ jdText = '', company = '', role = '' }) {
  const { byCategory, categoriesPresent, tagsByCategory } = extractSkills(jdText)
  const extractedSkills = {
    ...toCanonicalExtractedSkills(byCategory),
    byCategory,
    categoriesPresent,
    tagsByCategory,
  }
  const checklist = buildChecklist(byCategory, categoriesPresent)
  const plan7Days = buildSevenDayPlan(byCategory, categoriesPresent)
  const questions = generateQuestions(byCategory)
  const baseScore = computeReadinessScore({ jdText, company, role, categoriesPresent })

  const companyIntel = company?.trim()
    ? generateCompanyIntel({ company, jdText, extractedSkills: { byCategory, categoriesPresent, tagsByCategory } })
    : null

  const roundMapping = companyIntel?.roundMapping ?? []

  return {
    extractedSkills,
    roundMapping,
    checklist,
    plan7Days,
    plan: plan7Days,
    questions,
    baseScore,
    finalScore: baseScore,
    companyIntel,
  }
}
