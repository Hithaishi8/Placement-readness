import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Unlock, Rocket, ArrowRight, AlertOctagon } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'

export default function ShipLock() {
    const [isUnlocked, setIsUnlocked] = useState(false)

    const checkStatus = () => {
        try {
            const saved = localStorage.getItem('prp-test-checklist')
            if (!saved) return false
            const data = JSON.parse(saved)
            // Check if all 10 expected keys are present and true
            // Hardcoded list of expected keys based on TestChecklist.jsx
            const expectedKeys = [
                'jd-validation', 'short-jd-warning', 'skills-extraction',
                'round-mapping', 'score-deterministic', 'skill-toggles',
                'persistence', 'history-load', 'export-content', 'no-console-errors'
            ]
            return expectedKeys.every(key => data[key] === true)
        } catch {
            return false
        }
    }

    useEffect(() => {
        // Initial check
        setIsUnlocked(checkStatus())

        // Listen for storage changes (cross-tab)
        const handleStorage = () => setIsUnlocked(checkStatus())
        window.addEventListener('storage', handleStorage)

        // Also listen for our custom event in case of same-tab navigation
        // (though not strictly necessary as we mount/unmount, but good for safety)

        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    if (!isUnlocked) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
                <div className="bg-gray-100 p-6 rounded-full">
                    <Lock className="w-16 h-16 text-gray-400" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h1 className="text-2xl font-bold text-gray-900">Shipment Locked</h1>
                    <p className="text-gray-600">
                        You cannot proceed to shipping until all tests have passed.
                        Complete the pre-shipment checklist first.
                    </p>
                </div>
                <Link
                    to="/prp/07-test"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                >
                    Go to Checklist
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center animate-in fade-in duration-500">
            <div className="bg-emerald-100 p-8 rounded-full shadow-lg shadow-emerald-100">
                <Rocket className="w-20 h-20 text-emerald-600 ml-1" />
            </div>
            <div className="space-y-3 max-w-lg">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                    Ready to Ship!
                </h1>
                <p className="text-xl text-gray-600">
                    All systems go. The placement readiness platform is verified and ready for deployment.
                </p>
            </div>

            <Card className="w-full max-w-md border-emerald-200 bg-emerald-50/50">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-emerald-800">
                        <Unlock className="w-6 h-6 shrink-0" />
                        <span className="font-medium text-left">Quality Gate Passed. Build authorized.</span>
                    </div>
                </CardContent>
            </Card>

            <button
                className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                onClick={() => alert('Initiating standard ship procedure... (simulation)')}
            >
                INITIATE LAUNCH SEQUENCE
            </button>
        </div>
    )
}
