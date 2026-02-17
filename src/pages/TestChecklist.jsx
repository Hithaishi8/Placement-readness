import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { CheckSquare, Square, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react'

const checklistItems = [
    { id: 'jd-validation', label: 'JD required validation works', hint: 'Try analyzing without a JD. Should show error.' },
    { id: 'short-jd-warning', label: 'Short JD warning shows for <200 chars', hint: 'Paste a short string. Verify warning appears.' },
    { id: 'skills-extraction', label: 'Skills extraction groups correctly', hint: 'Check if skills are categorized (Frontend, Backend, etc.).' },
    { id: 'round-mapping', label: 'Round mapping changes based on company + skills', hint: 'Change company name or skills, verify rounds update.' },
    { id: 'score-deterministic', label: 'Score calculation is deterministic', hint: 'Same inputs should yield same score.' },
    { id: 'skill-toggles', label: 'Skill toggles update score live', hint: 'Toggle "I know" on skills in Results page.' },
    { id: 'persistence', label: 'Changes persist after refresh', hint: 'Reload page. Data should remain.' },
    { id: 'history-load', label: 'History saves and loads correctly', hint: 'Check History tab for recent analyses.' },
    { id: 'export-content', label: 'Export buttons copy the correct content', hint: 'Click copy/download and verify text.' },
    { id: 'no-console-errors', label: 'No console errors on core pages', hint: 'Open DevTools (F12) and browse.' },
]

export default function TestChecklist() {
    const [checkedState, setCheckedState] = useState(() => {
        try {
            const saved = localStorage.getItem('prp-test-checklist')
            return saved ? JSON.parse(saved) : {}
        } catch {
            return {}
        }
    })

    // Sync to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('prp-test-checklist', JSON.stringify(checkedState))

        // Dispatch event for other tabs/components
        window.dispatchEvent(new Event('storage'))
    }, [checkedState])

    const handleToggle = (id) => {
        setCheckedState((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    const handleReset = () => {
        if (confirm('Are you sure you want to reset the checklist?')) {
            setCheckedState({})
        }
    }

    const checkedCount = checklistItems.filter((item) => checkedState[item.id]).length
    const totalCount = checklistItems.length
    const isComplete = checkedCount === totalCount
    const progress = (checkedCount / totalCount) * 100

    return (
        <div className="max-w-3xl mx-auto space-y-8 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900">Pre-Shipment Checklist</h1>
                <p className="text-gray-600">Ensure all functionality works before unlocking shipping.</p>
            </div>

            <Card className={isComplete ? 'border-emerald-500 bg-emerald-50' : 'border-amber-200 bg-amber-50'}>
                <CardContent className="pt-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {isComplete ? (
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        ) : (
                            <AlertTriangle className="w-8 h-8 text-amber-600" />
                        )}
                        <div>
                            <p className="text-lg font-semibold text-gray-900">
                                Tests Passed: {checkedCount} / {totalCount}
                            </p>
                            <p className={`text-sm ${isComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {isComplete ? 'Ready to ship!' : 'Fix issues before shipping.'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset checklist
                    </button>
                </CardContent>
            </Card>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ease-out ${isComplete ? 'bg-emerald-500' : 'bg-primary'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="space-y-3">
                {checklistItems.map((item) => {
                    const isChecked = !!checkedState[item.id]
                    return (
                        <div
                            key={item.id}
                            onClick={() => handleToggle(item.id)}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${isChecked
                                    ? 'bg-white border-emerald-200 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-primary/30 hover:shadow-md'
                                }`}
                        >
                            <div className={`mt-0.5 transition-colors ${isChecked ? 'text-emerald-500' : 'text-gray-300 group-hover:text-primary'}`}>
                                {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className={`font-medium ${isChecked ? 'text-gray-900 line-through opacity-70' : 'text-gray-900'}`}>
                                    {item.label}
                                </p>
                                {item.hint && (
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        <span className="font-semibold text-xs uppercase tracking-wide text-gray-400 mr-1">Test:</span>
                                        {item.hint}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
