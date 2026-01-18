'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui'
import { StepNavigation } from '@/components/layout'
import { useCourseStore, useUIStore } from '@/stores'
import { COMPETENCY_TYPES, COURSE_LEVELS, type CompetencyType, type CourseLevel } from '@/types/schema'

export default function UnpackStep2() {
  const router = useRouter()
  const { course, coreCompetency, updateCourse, updateCoreCompetency } = useCourseStore()
  const { markStepCompleted, setCurrentStep } = useUIStore()

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

      {/* Orientation Card - always visible, sets context */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-xs font-medium">?</span>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">The core competency</span> is the through-line of your course—the single integrated capability learners should demonstrate by the end. Most emphasize <span className="font-medium">knowledge + skill + judgment</span> working together.
            </p>
          </div>
        </div>
      </div>

      {/* Course Metadata - Compact inline chips */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Course Information</h2>
          <Badge variant="ai">AI Extracted</Badge>
        </div>

        {/* Title - full width */}
        <input
          type="text"
          value={course.title || ''}
          onChange={(e) => updateCourse({ title: e.target.value })}
          className="w-full text-lg font-semibold text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:ring-1 focus:ring-primary-300 focus:border-primary-300 placeholder:text-gray-400 placeholder:font-normal"
          placeholder="Course title"
        />

        {/* Metadata chips */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 bg-gray-100 rounded-lg px-2.5 py-1.5">
            <span className="text-xs text-gray-500">Code</span>
            <input
              type="text"
              value={course.code || ''}
              onChange={(e) => updateCourse({ code: e.target.value })}
              className="w-24 text-sm font-medium text-gray-900 bg-transparent border-0 focus:ring-0 p-0 placeholder:text-gray-400 placeholder:font-normal"
              placeholder="HIST 301"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-gray-100 rounded-lg px-2.5 py-1.5">
            <span className="text-xs text-gray-500">Discipline</span>
            <input
              type="text"
              value={course.discipline || ''}
              onChange={(e) => updateCourse({ discipline: e.target.value })}
              className="w-20 text-sm font-medium text-gray-900 bg-transparent border-0 focus:ring-0 p-0 placeholder:text-gray-400 placeholder:font-normal"
              placeholder="History"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-gray-100 rounded-lg px-2.5 py-1.5">
            <span className="text-xs text-gray-500">Level</span>
            <select
              value={course.level || ''}
              onChange={(e) => updateCourse({ level: e.target.value as CourseLevel })}
              className="text-sm font-medium text-gray-900 bg-transparent border-0 focus:ring-0 p-0 pr-6 cursor-pointer"
            >
              <option value="">Select</option>
              {COURSE_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-gray-100 rounded-lg px-2.5 py-1.5">
            <span className="text-xs text-gray-500">Credits</span>
            <input
              type="number"
              min="0"
              max="12"
              value={course.credits || ''}
              onChange={(e) => updateCourse({ credits: e.target.value ? Number(e.target.value) : undefined })}
              className="w-8 text-sm font-medium text-gray-900 bg-transparent border-0 focus:ring-0 p-0 placeholder:text-gray-400"
              placeholder="3"
            />
          </div>
        </div>
      </div>

      {/* Core Competency */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Core Competency</h2>
          <Badge variant="ai">AI Suggested</Badge>
        </div>

        {/* Statement - click to edit */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">
            What will learners be able to do by the end of this course?
          </p>
          <textarea
            value={coreCompetency.statement || ''}
            onChange={(e) => updateCoreCompetency({ statement: e.target.value })}
            placeholder="Learners will be able to..."
            rows={2}
            className="w-full text-gray-900 bg-white border border-gray-200 rounded-lg p-3 focus:ring-1 focus:ring-primary-300 focus:border-primary-300 resize-none placeholder:text-gray-400 text-base leading-relaxed"
          />
        </div>

        {/* Type - inline chip style */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-primary-200">
            <span className="text-xs text-gray-500">Type</span>
            <select
              value={coreCompetency.type || ''}
              onChange={(e) => updateCoreCompetency({ type: e.target.value as CompetencyType })}
              className="text-sm font-medium text-gray-900 bg-transparent border-0 focus:ring-0 p-0 pr-6 cursor-pointer"
            >
              <option value="">Select</option>
              {COMPETENCY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          {coreCompetency.type && (
            <span className="text-xs text-gray-500">
              {COMPETENCY_TYPES.find((t) => t.value === coreCompetency.type)?.description}
            </span>
          )}
        </div>
      </div>

      <StepNavigation
        onNext={handleSaveAndContinue}
        nextDisabled={!coreCompetency.statement || !coreCompetency.type}
      />
    </div>
  )
}
