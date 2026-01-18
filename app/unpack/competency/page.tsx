'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Textarea, Select, Badge, Button } from '@/components/ui'
import { StepNavigation } from '@/components/layout'
import { useCourseStore, useUIStore } from '@/stores'
import { COMPETENCY_TYPES, COURSE_LEVELS, type CompetencyType, type CourseLevel } from '@/types/schema'

export default function UnpackStep2() {
  const router = useRouter()
  const { course, coreCompetency, updateCourse, updateCoreCompetency } = useCourseStore()
  const { markStepCompleted, setCurrentStep } = useUIStore()

  const [isEditing, setIsEditing] = useState(false)

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const handleSaveAndContinue = () => {
    markStepCompleted(2)
    setCurrentStep(3)
    router.push('/unpack/modules')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Define Core Competency</h1>
        <p className="text-gray-600 mt-1">
          Review and refine the central competency that students will develop in this course.
        </p>
      </div>

      {/* Why This Matters - moved to top for context */}
      <details className="group bg-gray-50 rounded-xl p-4">
        <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
          <svg
            className="w-4 h-4 transform transition-transform group-open:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Why define a core competency?
        </summary>
        <div className="mt-3 pl-6 text-sm text-gray-600 space-y-2">
          <p>
            The core competency is the central &quot;through-line&quot; of your course - the one thing you most want students to be able to do when they finish.
          </p>
          <p>
            This helps AI tutors understand the big picture and ensures that every module and assessment connects back to this central goal.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {COMPETENCY_TYPES.map((type) => (
              <div key={type.value} className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="font-medium text-gray-900 text-sm">{type.label}</p>
                <p className="text-xs text-gray-500">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </details>

      {/* Course Metadata Summary */}
      <Card variant="bordered">
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Course Information</h2>
            <Badge variant="ai">AI Extracted</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Course Title
              </label>
              <input
                type="text"
                value={course.title || ''}
                onChange={(e) => updateCourse({ title: e.target.value })}
                className="mt-1 block w-full text-gray-900 bg-transparent border-0 border-b border-gray-200 focus:border-primary-500 focus:ring-0 px-0 py-1"
                placeholder="Enter course title"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Course Code
              </label>
              <input
                type="text"
                value={course.code || ''}
                onChange={(e) => updateCourse({ code: e.target.value })}
                className="mt-1 block w-full text-gray-900 bg-transparent border-0 border-b border-gray-200 focus:border-primary-500 focus:ring-0 px-0 py-1"
                placeholder="e.g., ECON 101"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Discipline
              </label>
              <input
                type="text"
                value={course.discipline || ''}
                onChange={(e) => updateCourse({ discipline: e.target.value })}
                className="mt-1 block w-full text-gray-900 bg-transparent border-0 border-b border-gray-200 focus:border-primary-500 focus:ring-0 px-0 py-1"
                placeholder="e.g., Economics"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Level
              </label>
              <Select
                value={course.level || ''}
                onChange={(value) => updateCourse({ level: value as CourseLevel })}
                options={COURSE_LEVELS.map((l) => ({ value: l.value, label: l.label }))}
                placeholder="Select level"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Competency */}
      <Card variant="ai-suggestion">
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Core Competency</h2>
            <div className="flex items-center gap-2">
              <Badge variant="ai">AI Suggested</Badge>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {isEditing ? 'Done' : 'Edit'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Competency Statement
              </label>
              <p className="text-xs text-gray-500 mb-2">
                What will learners be able to do by the end of this course?
              </p>
              {isEditing ? (
                <Textarea
                  value={coreCompetency.statement || ''}
                  onChange={(e) => updateCoreCompetency({ statement: e.target.value })}
                  placeholder="Learners will be able to..."
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-gray-900">
                    {coreCompetency.statement || (
                      <span className="text-gray-400 italic">No competency statement defined</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Competency Type
              </label>
              <Select
                value={coreCompetency.type || ''}
                onChange={(value) => updateCoreCompetency({ type: value as CompetencyType })}
                options={COMPETENCY_TYPES.map((t) => ({
                  value: t.value,
                  label: t.label,
                  description: t.description,
                }))}
                placeholder="Select competency type"
                className="mt-2"
              />
              {coreCompetency.type && (
                <p className="text-xs text-gray-500 mt-1">
                  {COMPETENCY_TYPES.find((t) => t.value === coreCompetency.type)?.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <StepNavigation
        onNext={handleSaveAndContinue}
        nextDisabled={!coreCompetency.statement || !coreCompetency.type}
      />
    </div>
  )
}
