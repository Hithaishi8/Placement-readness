/**
 * Company Intel — heuristic company profiling and round mapping.
 * No external APIs. Demo mode: all data generated from heuristics.
 */

const KNOWN_ENTERPRISE = [
  'amazon', 'infosys', 'tcs', 'wipro', 'accenture', 'cognizant', 'hcl', 'tech mahindra',
  'capgemini', 'lti', 'mindtree', 'google', 'microsoft', 'meta', 'apple', 'netflix',
  'oracle', 'ibm', 'sap', 'salesforce', 'adobe', 'intel', 'nvidia', 'cisco',
  'jpmorgan', 'goldman sachs', 'morgan stanley', 'deloitte', 'ey', 'kpmg', 'pwc',
]

const KNOWN_MIDSIZE = [
  'razorpay', 'cred', 'swiggy', 'zomato', 'ola', 'paytm', 'phonepe', 'policybazaar',
  'freshworks', 'zoho', 'postman', 'hasura', 'thoughtworks',
]

const INDUSTRY_KEYWORDS = {
  'FinTech': ['payment', 'banking', 'fintech', 'transaction', 'wallet', 'lending', 'insurance', 'investment'],
  'E-commerce': ['ecommerce', 'e-commerce', 'marketplace', 'retail', 'inventory', 'order'],
  'HealthTech': ['healthcare', 'medical', 'clinical', 'patient', 'health tech', 'hospital'],
  'EdTech': ['education', 'learning', 'edtech', 'course', 'student', 'curriculum'],
  'SaaS': ['saas', 'subscription', 'b2b', 'enterprise software', 'cloud platform'],
  'Technology Services': [], // default
}

/**
 * Infer company size: startup (<200), mid-size (200–2000), enterprise (2000+).
 * Known enterprise list → Enterprise. Known mid-size → Mid-size. Unknown → Startup.
 */
export function inferCompanySize(company) {
  if (!company || typeof company !== 'string') return 'startup'
  const c = company.trim().toLowerCase()
  if (!c) return 'startup'
  if (KNOWN_ENTERPRISE.some((e) => c.includes(e))) return 'enterprise'
  if (KNOWN_MIDSIZE.some((m) => c.includes(m))) return 'mid-size'
  return 'startup'
}

/**
 * Infer industry from JD text or company. Default: Technology Services.
 */
export function inferIndustry(jdText = '', company = '') {
  const text = `${jdText} ${company}`.toLowerCase()
  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (industry === 'Technology Services') continue
    if (keywords.some((kw) => text.includes(kw.toLowerCase()))) return industry
  }
  return 'Technology Services'
}

/**
 * Typical hiring focus based on company size.
 */
export function getTypicalHiringFocus(size) {
  switch (size) {
    case 'enterprise':
      return 'Structured DSA rounds, strong core CS fundamentals, and systematic problem-solving. Emphasis on algorithms, data structures, OOP, DBMS, and behavioral fit.'
    case 'mid-size':
      return 'Balanced mix of DSA and system design. Practical problem-solving plus domain depth. Expect coding assessments and project deep-dives.'
    case 'startup':
    default:
      return 'Practical problem-solving, hands-on coding, and stack depth. Focus on what you can build, system thinking, and culture fit over formal DSA rounds.'
  }
}

/**
 * Size label for display.
 */
function sizeLabel(size) {
  switch (size) {
    case 'enterprise': return 'Enterprise (2000+)'
    case 'mid-size': return 'Mid-size (200–2000)'
    case 'startup':
    default: return 'Startup (<200)'
  }
}

/**
 * Round mapping definitions with "why this round matters".
 */
const ROUND_WHY = {
  onlineTest: 'Filters candidates at scale. Strong performance here opens the door to later rounds.',
  technicalDSA: 'Core technical competency. Demonstrates problem-solving and coding fluency.',
  techProjects: 'Validates real-world experience. Be ready to explain architecture and trade-offs.',
  systemDiscussion: 'Assesses system design and scalability thinking. Critical for product roles.',
  cultureFit: 'Ensures mutual fit. Communicate clearly and show genuine interest.',
  hr: 'Final alignment on expectations and values. Confidence and clarity matter.',
  practicalCoding: 'Shows you can build, not just theorize. Often pair programming or take-home.',
}

/**
 * Build dynamic round mapping from company size and detected skills.
 */
export function buildRoundMapping(companySize, byCategory = {}) {
  const has = (k) => byCategory[k]?.length > 0
  const hasDSA = has('coreCS')
  const hasWeb = has('web') || has('languages')
  const hasData = has('data')
  const hasCloud = has('cloudDevOps')

  if (companySize === 'enterprise') {
    const rounds = [
      { name: 'Round 1: Online Test', focus: 'DSA + Aptitude', whyMatters: ROUND_WHY.onlineTest },
      { name: 'Round 2: Technical', focus: hasDSA ? 'DSA + Core CS' : 'Coding + Fundamentals', whyMatters: ROUND_WHY.technicalDSA },
      { name: 'Round 3: Tech + Projects', focus: 'Projects, stack deep-dive', whyMatters: ROUND_WHY.techProjects },
      { name: 'Round 4: HR', focus: 'Behavioral, fit', whyMatters: ROUND_WHY.hr },
    ]
    if (!hasDSA) rounds[0] = { name: 'Round 1: Online Test', focus: 'Aptitude + Basic Coding', whyMatters: ROUND_WHY.onlineTest }
    return rounds
  }

  if (companySize === 'mid-size') {
    return [
      { name: 'Round 1: Online Assessment', focus: hasDSA ? 'Coding + Aptitude' : 'Aptitude + Problem-solving', whyMatters: ROUND_WHY.onlineTest },
      { name: 'Round 2: Technical Interview', focus: hasWeb ? 'Coding + Projects' : 'DSA + Fundamentals', whyMatters: ROUND_WHY.technicalDSA },
      { name: 'Round 3: System / Project Discussion', focus: hasCloud ? 'System design + Projects' : 'Projects + Stack', whyMatters: ROUND_WHY.systemDiscussion },
      { name: 'Round 4: HR / Culture Fit', focus: 'Values, motivation', whyMatters: ROUND_WHY.cultureFit },
    ]
  }

  // Startup
  if (hasWeb) {
    return [
      { name: 'Round 1: Practical Coding', focus: 'Build / Debug / Pair', whyMatters: ROUND_WHY.practicalCoding },
      { name: 'Round 2: System Discussion', focus: 'Architecture, scalability', whyMatters: ROUND_WHY.systemDiscussion },
      { name: 'Round 3: Culture Fit', focus: 'Team fit, motivation', whyMatters: ROUND_WHY.cultureFit },
    ]
  }
  if (hasDSA) {
    return [
      { name: 'Round 1: Coding Challenge', focus: 'Problem-solving', whyMatters: ROUND_WHY.practicalCoding },
      { name: 'Round 2: Technical Interview', focus: 'DSA + Fundamentals', whyMatters: ROUND_WHY.technicalDSA },
      { name: 'Round 3: Culture Fit', focus: 'Values, fit', whyMatters: ROUND_WHY.cultureFit },
    ]
  }
  return [
    { name: 'Round 1: Screening', focus: 'Aptitude / Basic Coding', whyMatters: ROUND_WHY.onlineTest },
    { name: 'Round 2: Technical', focus: 'Projects + Stack', whyMatters: ROUND_WHY.techProjects },
    { name: 'Round 3: Culture Fit', focus: 'Team fit', whyMatters: ROUND_WHY.cultureFit },
  ]
}

/**
 * Generate full company intel object.
 */
export function generateCompanyIntel({ company = '', jdText = '', extractedSkills = {} }) {
  if (!company || !company.trim()) return null
  const byCategory = extractedSkills.byCategory ?? {}
  const size = inferCompanySize(company)
  const industry = inferIndustry(jdText, company)
  const hiringFocus = getTypicalHiringFocus(size)
  const roundMapping = buildRoundMapping(size, byCategory)

  return {
    company: company.trim(),
    industry,
    size,
    sizeLabel: sizeLabel(size),
    hiringFocus,
    roundMapping,
  }
}
