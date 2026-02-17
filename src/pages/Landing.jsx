import { Link } from 'react-router-dom'
import { Code2, Video, BarChart3 } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <header className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Ace Your Placement
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-8">
          Practice, assess, and prepare for your dream job
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
        >
          Get Started
        </Link>
      </header>

      {/* Features grid */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center text-primary mb-4">
              <Code2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Practice Problems</h2>
            <p className="text-gray-600 text-sm">
              Solve curated problems and build strong fundamentals for technical rounds.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center text-primary mb-4">
              <Video className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Mock Interviews</h2>
            <p className="text-gray-600 text-sm">
              Simulate real interviews with timed mock sessions and feedback.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center text-primary mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h2>
            <p className="text-gray-600 text-sm">
              Monitor your growth with analytics and personalized recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 border-t border-gray-200">
        © {new Date().getFullYear()} Placement Readiness Platform. All rights reserved.
      </footer>
    </div>
  )
}
