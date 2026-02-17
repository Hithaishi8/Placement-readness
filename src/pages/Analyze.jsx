import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { runAnalysis } from '../lib/analysis'
import { saveAnalysis } from '../lib/history'
import { FileSearch } from 'lucide-react'

export default function Analyze() {
  const navigate = useNavigate()
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const jdShort = jdText.trim().length > 0 && jdText.trim().length < 200

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const trimmed = jdText.trim()
    if (!trimmed) {
      setError('Please paste the job description text.')
      return
    }
    setLoading(true)
    try {
      const result = runAnalysis({ jdText: trimmed, company: company.trim(), role: role.trim() })
      const id = saveAnalysis({ company: company.trim(), role: role.trim(), jdText: trimmed, ...result })
      navigate(`/dashboard/results?id=${encodeURIComponent(id)}`)
    } catch (err) {
      setError('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Analyze JD</h2>
        <p className="text-gray-600 text-sm">Paste a job description to extract skills and get a preparation plan.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-primary" />
              Job Description Analysis
            </CardTitle>
            <CardDescription>We'll detect skills and generate a readiness plan. No data is sent externally.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company (optional)</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Google, Microsoft"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role (optional)</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="e.g. SDE 1, Full Stack Developer"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job description text *</label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={12}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
                placeholder="Paste the full job description here..."
                required
                minLength={1}
              />
              {jdShort && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                  This JD is too short to analyze deeply. Paste full JD for better output.
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Longer JDs (800+ chars) get a small score boost.</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
