import { Outlet, NavLink, useLocation } from 'react-router-dom'
import ErrorBoundary from '../components/ErrorBoundary'
import {
  LayoutDashboard,
  Code2,
  ClipboardCheck,
  BookOpen,
  User,
  FileSearch,
  FileText,
  History,
  Lock,
  ShieldCheck,
} from 'lucide-react'


const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/practice', icon: Code2, label: 'Practice' },
  { to: '/dashboard/assessments', icon: ClipboardCheck, label: 'Assessments' },
  { to: '/dashboard/resources', icon: BookOpen, label: 'Resources' },
  { to: '/dashboard/analyze', icon: FileSearch, label: 'Analyze JD' },
  { to: '/dashboard/results', icon: FileText, label: 'Results' },
  { to: '/dashboard/history', icon: History, label: 'History' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
  { to: '/prp/07-test', icon: ClipboardCheck, label: 'Test Checklist' },
  { to: '/prp/08-ship', icon: Lock, label: 'Ship Lock' },
  { to: '/prp/proof', icon: ShieldCheck, label: 'Proof of Work' },
]


export default function DashboardLayout() {
  const location = useLocation()
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <span className="font-semibold text-gray-900">Placement Prep</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 px-6 flex items-center justify-between bg-white border-b border-gray-200 shrink-0">
          <h1 className="text-lg font-semibold text-gray-900">Placement Prep</h1>
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <ErrorBoundary key={location.pathname + (location.search || '')}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
