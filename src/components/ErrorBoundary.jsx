import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Error caught by boundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      const err = this.state.error
      const msg = err?.message || String(err) || 'Unknown error'
      return (
        <div className="p-6 rounded-lg border border-amber-200 bg-amber-50" style={{ minHeight: 200 }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-700 mb-4 font-mono break-all" title={err?.stack}>
            {msg}
          </p>
          <p className="text-xs text-gray-500 mb-4">Use the sidebar to navigate elsewhere.</p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem('placement_prep_history')
                  window.location.reload()
                } catch {}
              }}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-sm font-medium hover:bg-amber-100"
            >
              Clear saved data & reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
