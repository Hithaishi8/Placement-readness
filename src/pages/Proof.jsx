import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, AlertCircle, Copy, ExternalLink, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'

const STEPS = [
    { id: '1', label: 'Setup & Routing' },
    { id: '2', label: 'Dashboard Layout' },
    { id: '3', label: 'Practice Section' },
    { id: '4', label: 'Assessments' },
    { id: '5', label: 'Resources' },
    { id: '6', label: 'Analyze JD' },
    { id: '7', label: 'Test Checklist (10/10)' },
    { id: '8', label: 'Ship Lock' },
]

export default function Proof() {
    const [checklistPassed, setChecklistPassed] = useState(false)

    // Step completion state
    const [stepsStatus, setStepsStatus] = useState(() => {
        try {
            const saved = localStorage.getItem('prp-steps-status')
            return saved ? JSON.parse(saved) : {}
        } catch {
            return {}
        }
    })

    // Artifact links state
    const [links, setLinks] = useState(() => {
        try {
            const saved = localStorage.getItem('prp-final-submission')
            return saved ? JSON.parse(saved) : { lovable: '', github: '', deployed: '' }
        } catch {
            return { lovable: '', github: '', deployed: '' }
        }
    })

    const [copyFeedback, setCopyFeedback] = useState(null)

    // Check checklist status (10 items)
    useEffect(() => {
        const checkChecklist = () => {
            try {
                const saved = localStorage.getItem('prp-test-checklist')
                if (!saved) return false
                const data = JSON.parse(saved)
                // Check if >= 10 items are true (assuming keys are correct from Checklist page)
                // Hardcoded length check for simplicity as keys might vary if we change them
                const passedCount = Object.values(data).filter(Boolean).length
                return passedCount >= 10
            } catch {
                return false
            }
        }
        setChecklistPassed(checkChecklist())

        // Listen for updates
        const handleStorage = () => setChecklistPassed(checkChecklist())
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    // Persist steps
    useEffect(() => {
        localStorage.setItem('prp-steps-status', JSON.stringify(stepsStatus))
    }, [stepsStatus])

    // Persist links
    useEffect(() => {
        localStorage.setItem('prp-final-submission', JSON.stringify(links))
    }, [links])

    const toggleStep = (id) => {
        setStepsStatus(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const isValidUrl = (string) => {
        try {
            new URL(string)
            return true
        } catch (_) {
            return false
        }
    }

    const allStepsCompleted = STEPS.every(step => stepsStatus[step.id])
    const allLinksValid = isValidUrl(links.lovable) && isValidUrl(links.github) && isValidUrl(links.deployed)
    const isShippable = allStepsCompleted && checklistPassed && allLinksValid

    const handleCopy = () => {
        const text = `------------------------------------------
Placement Readiness Platform — Final Submission

Lovable Project: ${links.lovable}
GitHub Repository: ${links.github}
Live Deployment: ${links.deployed}

Core Capabilities:
- JD skill extraction (deterministic)
- Round mapping engine
- 7-day prep plan
- Interactive readiness scoring
- History persistence
------------------------------------------`

        navigator.clipboard.writeText(text).then(() => {
            setCopyFeedback('Copied!')
            setTimeout(() => setCopyFeedback(null), 2000)
        })
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">

            {/* Header & Badge */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Proof of Work</h1>
                    <p className="text-gray-600">Final verification and deployment readiness.</p>
                </div>
                <div>
                    {isShippable ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            <Trophy className="w-5 h-5 text-emerald-600" />
                            Shipped
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-medium border border-gray-200">
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                            In Progress
                        </span>
                    )}
                </div>
            </div>

            {isShippable && (
                <Card className="border-emerald-500 bg-emerald-50 shadow-lg mb-8">
                    <CardContent className="pt-6 text-center space-y-2">
                        <h2 className="text-2xl font-bold text-emerald-900">You built a real product.</h2>
                        <p className="text-emerald-800 text-lg">Not a tutorial. Not a clone. A structured tool that solves a real problem.</p>
                        <p className="text-emerald-700 font-medium mt-2">This is your proof of work.</p>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section A: Steps */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</div>
                        Step Completion
                    </h2>
                    <Card>
                        <CardContent className="p-0 divide-y divide-gray-100">
                            {STEPS.map((step) => {
                                const isChecked = stepsStatus[step.id]
                                return (
                                    <div
                                        key={step.id}
                                        onClick={() => toggleStep(step.id)}
                                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isChecked ? 'bg-gray-50/50' : ''}`}
                                    >
                                        <span className={`font-medium ${isChecked ? 'text-gray-900' : 'text-gray-500'}`}>
                                            {step.label}
                                        </span>
                                        {isChecked ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-gray-300" />
                                        )}
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>

                    <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700 flex gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>Checklist Test status: {checklistPassed ? <span className="font-bold text-emerald-600">PASSED (10/10)</span> : <span className="font-bold text-amber-600">PENDING</span>}</p>
                    </div>
                </div>

                {/* Section B: Artifacts */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</div>
                        Artifact Submission
                    </h2>
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Lovable Project Link</label>
                                <input
                                    type="url"
                                    placeholder="https://lovable.dev/..."
                                    value={links.lovable}
                                    onChange={(e) => setLinks(p => ({ ...p, lovable: e.target.value }))}
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none ${links.lovable && !isValidUrl(links.lovable) ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">GitHub Repository</label>
                                <input
                                    type="url"
                                    placeholder="https://github.com/..."
                                    value={links.github}
                                    onChange={(e) => setLinks(p => ({ ...p, github: e.target.value }))}
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none ${links.github && !isValidUrl(links.github) ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Live Deployment</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={links.deployed}
                                    onChange={(e) => setLinks(p => ({ ...p, deployed: e.target.value }))}
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none ${links.deployed && !isValidUrl(links.deployed) ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Export */}
                    <button
                        onClick={handleCopy}
                        disabled={!isShippable}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${isShippable
                                ? 'bg-gray-900 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {copyFeedback ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                {copyFeedback}
                            </>
                        ) : (
                            <>
                                <Copy className="w-5 h-5" />
                                Copy Final Submission
                            </>
                        )}
                    </button>

                    {!isShippable && (
                        <p className="text-xs text-center text-gray-500">
                            Complete all steps, pass the checklist, and provide valid links to unlock submission.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
