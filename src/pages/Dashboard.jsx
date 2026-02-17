import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { Play } from 'lucide-react'

const READINESS_SCORE = 72
const READINESS_MAX = 100
const CIRCLE_SIZE = 140
const STROKE_WIDTH = 12
const radius = (CIRCLE_SIZE - STROKE_WIDTH) / 2
const circumference = 2 * Math.PI * radius

const skillData = [
  { subject: 'DSA', value: 75, fullMark: 100 },
  { subject: 'System Design', value: 60, fullMark: 100 },
  { subject: 'Communication', value: 80, fullMark: 100 },
  { subject: 'Resume', value: 85, fullMark: 100 },
  { subject: 'Aptitude', value: 70, fullMark: 100 },
]

const weekDays = [
  { label: 'Mon', active: true },
  { label: 'Tue', active: true },
  { label: 'Wed', active: false },
  { label: 'Thu', active: true },
  { label: 'Fri', active: true },
  { label: 'Sat', active: false },
  { label: 'Sun', active: false },
]

const assessments = [
  { title: 'DSA Mock Test', when: 'Tomorrow, 10:00 AM' },
  { title: 'System Design Review', when: 'Wed, 2:00 PM' },
  { title: 'HR Interview Prep', when: 'Friday, 11:00 AM' },
]

export default function Dashboard() {
  const [readinessOffset, setReadinessOffset] = useState(circumference)

  useEffect(() => {
    const targetOffset = circumference * (1 - READINESS_SCORE / READINESS_MAX)
    const id = setTimeout(() => setReadinessOffset(targetOffset), 100)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 text-sm">Your placement readiness at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Readiness */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Readiness</CardTitle>
            <CardDescription>Your current placement readiness score</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative inline-flex items-center justify-center">
              <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} className="-rotate-90">
                <circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={radius}
                  fill="none"
                  stroke="hsl(245, 58%, 92%)"
                  strokeWidth={STROKE_WIDTH}
                />
                <circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={radius}
                  fill="none"
                  stroke="hsl(245, 58%, 51%)"
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={readinessOffset}
                  className="transition-[stroke-dashoffset] duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                  {READINESS_SCORE}/{READINESS_MAX}
                </span>
                <span className="text-xs font-medium text-gray-500 mt-0.5">Readiness Score</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Breakdown</CardTitle>
            <CardDescription>Scores across key placement areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillData} margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                  <PolarGrid stroke="hsl(245, 58%, 90%)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: 'hsl(245, 58%, 30%)', fontSize: 11 }}
                    tickLine={false}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(245, 58%, 45%)', fontSize: 10 }}
                    tickCount={5}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="hsl(245, 58%, 51%)"
                    fill="hsl(245, 58%, 51%)"
                    fillOpacity={0.4}
                    strokeWidth={1.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Continue Practice */}
        <Card>
          <CardHeader>
            <CardTitle>Continue Practice</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium text-gray-900">Dynamic Programming</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progress</span>
                <span>3 / 10 completed</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: '30%' }}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors">
              <Play className="w-4 h-4" />
              Continue
            </button>
          </CardFooter>
        </Card>

        {/* Weekly Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Goals</CardTitle>
            <CardDescription>Problems solved this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Problems Solved</span>
                <span className="font-medium text-gray-900">12 / 20 this week</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: '60%' }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2">
              {weekDays.map((day) => (
                <div
                  key={day.label}
                  className="flex flex-col items-center gap-1 flex-1"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      day.active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {day.label.slice(0, 1)}
                  </div>
                  <span className="text-[10px] text-gray-500">{day.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Assessments - full width on 2-col grid */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Assessments</CardTitle>
            <CardDescription>Scheduled mocks and reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-100">
              {assessments.map((item) => (
                <li
                  key={item.title}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.when}</p>
                  </div>
                  <button className="text-sm font-medium text-primary hover:text-primary-hover">
                    View
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
