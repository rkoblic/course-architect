'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Select, Textarea } from '@/components/ui'
import { StepNavigation } from '@/components/layout'
import { useContextStore, useUIStore } from '@/stores'
import {
  AI_POLICY_LEVELS,
  type AIPolicyLevel,
  type LearnerProfileType,
  type TeachingApproach,
  type Formality,
  type EncouragementStyle,
  type FeedbackApproach,
} from '@/types/schema'

const LEARNER_TYPES: { value: LearnerProfileType; label: string }[] = [
  { value: 'traditional_undergraduate', label: 'Traditional Undergraduates' },
  { value: 'adult_learner', label: 'Adult Learners' },
  { value: 'graduate', label: 'Graduate Students' },
  { value: 'professional', label: 'Working Professionals' },
  { value: 'career_changer', label: 'Career Changers' },
  { value: 'mixed', label: 'Mixed Population' },
]

const TEACHING_APPROACHES: { value: TeachingApproach; label: string }[] = [
  { value: 'lecture', label: 'Lecture-Based' },
  { value: 'discussion', label: 'Discussion-Based' },
  { value: 'problem_based', label: 'Problem-Based' },
  { value: 'project_based', label: 'Project-Based' },
  { value: 'studio', label: 'Studio/Workshop' },
  { value: 'flipped', label: 'Flipped Classroom' },
  { value: 'case_based', label: 'Case-Based' },
  { value: 'inquiry', label: 'Inquiry-Based' },
  { value: 'hybrid', label: 'Hybrid/Custom' },
]

export default function UnpackStep5() {
  const router = useRouter()
  const {
    aiPolicy,
    learnerProfile,
    teachingApproach,
    instructorPersona,
    disciplineConventions,
    updateAIPolicy,
    updateLearnerProfile,
    updateTeachingApproach,
    updateInstructorPersona,
    updateDisciplineConventions,
  } = useContextStore()
  const { markStepCompleted, setCurrentStep } = useUIStore()

  const [showAdvanced, setShowAdvanced] = useState(false)

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(5)
  }, [setCurrentStep])

  const handleSaveAndContinue = () => {
    markStepCompleted(5)
    setCurrentStep(6)
    router.push('/unpack/export')
  }

  const hasAIPolicy = aiPolicy.course_level !== undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Context Layer</h1>
        <p className="text-gray-600 mt-1">
          Provide context that helps AI understand how to engage with your course.
        </p>
      </div>

      {/* AI Policy - Required */}
      <Card variant="bordered" className="border-primary-200">
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">AI Use Policy</h3>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Required</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Course-Level Policy</label>
              <Select
                value={aiPolicy.course_level || ''}
                onChange={(value) => updateAIPolicy({ course_level: value as AIPolicyLevel })}
                options={AI_POLICY_LEVELS.map((p) => ({
                  value: p.value,
                  label: p.label,
                }))}
                placeholder="Select AI policy"
                className="mt-1"
              />
              {aiPolicy.course_level && (
                <p className="text-xs text-gray-500 mt-1">
                  {AI_POLICY_LEVELS.find((p) => p.value === aiPolicy.course_level)?.description}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Policy Details</label>
              <Textarea
                value={aiPolicy.details || ''}
                onChange={(e) => updateAIPolicy({ details: e.target.value })}
                placeholder="Explain your AI policy in detail..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Rationale</label>
              <Textarea
                value={aiPolicy.rationale || ''}
                onChange={(e) => updateAIPolicy({ rationale: e.target.value })}
                placeholder="Why did you choose this policy?"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learner Profile */}
      <Card variant="bordered">
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-4">Learner Profile</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Student Type</label>
              <Select
                value={learnerProfile.type || ''}
                onChange={(value) => updateLearnerProfile({ type: value as LearnerProfileType })}
                options={LEARNER_TYPES}
                placeholder="Select learner type"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Typical Background</label>
              <Textarea
                value={learnerProfile.typical_background || ''}
                onChange={(e) => updateLearnerProfile({ typical_background: e.target.value })}
                placeholder="Describe your typical students..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Common Challenges</label>
              <Textarea
                value={learnerProfile.common_challenges || ''}
                onChange={(e) => updateLearnerProfile({ common_challenges: e.target.value })}
                placeholder="What do students typically struggle with?"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teaching Approach */}
      <Card variant="bordered">
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-4">Teaching Approach</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Primary Approach</label>
              <Select
                value={teachingApproach.primary || ''}
                onChange={(value) => updateTeachingApproach({ primary: value as TeachingApproach })}
                options={TEACHING_APPROACHES}
                placeholder="Select teaching approach"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Secondary Approaches (optional)</label>
              <p className="text-xs text-gray-500 mb-2">Select any additional teaching methods you use</p>
              <div className="flex flex-wrap gap-3 mt-1">
                {TEACHING_APPROACHES.filter(a => a.value !== teachingApproach.primary).map((approach) => (
                  <label key={approach.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={teachingApproach.secondary?.includes(approach.value) || false}
                      onChange={(e) => {
                        const current = teachingApproach.secondary || []
                        if (e.target.checked) {
                          updateTeachingApproach({ secondary: [...current, approach.value] })
                        } else {
                          updateTeachingApproach({ secondary: current.filter(v => v !== approach.value) })
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    {approach.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Teaching Philosophy</label>
              <Textarea
                value={teachingApproach.philosophy || ''}
                onChange={(e) => updateTeachingApproach({ philosophy: e.target.value })}
                placeholder="Describe your pedagogical philosophy..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <svg
          className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Advanced Options (Instructor Persona & Discipline Conventions)
      </button>

      {showAdvanced && (
        <>
          {/* Instructor Persona */}
          <Card variant="bordered">
            <CardContent>
              <h3 className="font-semibold text-gray-900 mb-4">Instructor Persona for AI</h3>
              <p className="text-sm text-gray-500 mb-4">
                How should AI represent your voice when co-teaching?
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Formality</label>
                  <Select
                    value={instructorPersona.formality || ''}
                    onChange={(value) => updateInstructorPersona({ formality: value as Formality })}
                    options={[
                      { value: 'casual', label: 'Casual' },
                      { value: 'conversational', label: 'Conversational' },
                      { value: 'professional', label: 'Professional' },
                      { value: 'formal', label: 'Formal' },
                    ]}
                    placeholder="Select"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Encouragement</label>
                  <Select
                    value={instructorPersona.encouragement_style || ''}
                    onChange={(value) => updateInstructorPersona({ encouragement_style: value as EncouragementStyle })}
                    options={[
                      { value: 'warm_supportive', label: 'Warm & Supportive' },
                      { value: 'matter_of_fact', label: 'Matter-of-Fact' },
                      { value: 'challenging', label: 'Challenging' },
                      { value: 'socratic', label: 'Socratic' },
                    ]}
                    placeholder="Select"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Feedback</label>
                  <Select
                    value={instructorPersona.feedback_approach || ''}
                    onChange={(value) => updateInstructorPersona({ feedback_approach: value as FeedbackApproach })}
                    options={[
                      { value: 'strengths_first', label: 'Strengths First' },
                      { value: 'direct', label: 'Direct' },
                      { value: 'balanced', label: 'Balanced' },
                      { value: 'questioning', label: 'Questioning' },
                    ]}
                    placeholder="Select"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discipline Conventions */}
          <Card variant="bordered">
            <CardContent>
              <h3 className="font-semibold text-gray-900 mb-4">Discipline Conventions</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Citation Style</label>
                  <input
                    type="text"
                    value={disciplineConventions.citation_style || ''}
                    onChange={(e) => updateDisciplineConventions({ citation_style: e.target.value })}
                    placeholder="e.g., APA, MLA, Chicago"
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Terminology Notes</label>
                  <Textarea
                    value={disciplineConventions.terminology_notes || ''}
                    onChange={(e) => updateDisciplineConventions({ terminology_notes: e.target.value })}
                    placeholder="Important terminology conventions..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Ethical Considerations</label>
                  <Textarea
                    value={disciplineConventions.ethical_considerations || ''}
                    onChange={(e) => updateDisciplineConventions({ ethical_considerations: e.target.value })}
                    placeholder="Field-specific ethical considerations..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <StepNavigation
        onNext={handleSaveAndContinue}
        nextDisabled={!hasAIPolicy}
      />
    </div>
  )
}
