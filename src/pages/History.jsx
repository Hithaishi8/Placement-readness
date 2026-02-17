import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { getHistoryWithCorruptionInfo } from '../lib/history'
import { History as HistoryIcon } from 'lucide-react'

export default function History() {
  let entries = []
  let corruptedCount = 0
  try {
    const { entries: e, corruptedCount: c } = getHistoryWithCorruptionInfo()
    entries = Array.isArray(e) ? e.filter((x) => x && x.id) : []
    corruptedCount = c || 0
  } catch {
    entries = []
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">History</h2>
        <p className="text-gray-600 text-sm">Past JD analyses. Click one to view full results.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-primary" />
            Saved analyses
          </CardTitle>
          <CardDescription>Stored locally in your browser. Persists after refresh.</CardDescription>
        </CardHeader>
        <CardContent>
          {corruptedCount > 0 && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
              {corruptedCount === 1
                ? "One saved entry couldn't be loaded. Create a new analysis."
                : `${corruptedCount} saved entries couldn't be loaded. Create a new analysis.`}
            </p>
          )}
          {entries.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No analyses yet. Run one from Analyze JD.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {entries.map((e) => (
                <li key={e.id}>
                  <Link
                    to={`/dashboard/results?id=${encodeURIComponent(e.id)}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-4 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {e.company ?? 'No company'} {e.role ? `· ${e.role}` : ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        {e.createdAt ? new Date(e.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-primary">{e.finalScore ?? e.readinessScore ?? '—'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
