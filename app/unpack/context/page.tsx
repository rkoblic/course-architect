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

const FORMALITY_OPTIONS: { value: Formality; label: string }[] = [
  { value: 'casual', label: 'Casual' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'professional', label: 'Professional' },
  { value: 'formal', label: 'Formal' },
]

const ENCOURAGEMENT_OPTIONS: { value: EncouragementStyle; label: string }[] = [
  { value: 'warm_supportive', label: 'Warm' },
  { value: 'matter_of_fact', label: 'Matter-of-Fact' },
  { value: 'challenging', label: 'Challenging' },
  { value: 'socratic', label: 'Socratic' },
]

const FEEDBACK_OPTIONS: { value: FeedbackApproach; label: string }[] = [
  { value: 'strengths_first', label: 'Strengths First' },
  { value: 'direct', label: 'Direct' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'questioning', label: 'Questioning' },
]

// Collapsible Section Component
function CollapsibleSection({
  id,
  title,
  isExpanded,
  onToggle,
  isComplete,
  required,
  summary,
  children,
}: {
  id: string
  title: string
  isExpanded: boolean
  onToggle: () => void
  isComplete?: boolean
  required?: boolean
  summary?: string
  children: React.ReactNode
}) {
  return (
    <Card variant="bordered" className={required ? 'border-primary-200' : ''}>
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {required && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Required</span>
          )}
          {isComplete && (
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        {!isExpanded && summary && (
          <span className="text-sm text-gray-500 truncate max-w-[300px]">{summary}</span>
        )}
      </button>
      {isExpanded && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  )
}

export default function UnpackStep6() {
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

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['ai-policy']))

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(6)
  }, [setCurrentStep])

  const handleSaveAndContinue = () => {
    markStepCompleted(6)
    setCurrentStep(7)
    router.push('/unpack/export')
  }

  // Completion checks
  const hasAIPolicy = aiPolicy.course_level !== undefined
  const hasLearnerProfile = !!learnerProfile.type
  const hasTeachingApproach = !!teachingApproach.primary
  const hasInstructorPersona =
    !!instructorPersona.formality ||
    !!instructorPersona.encouragement_style ||
    !!instructorPersona.feedback_approach
  const hasDisciplineConventions =
    !!disciplineConventions.citation_style ||
    !!disciplineConventions.terminology_notes ||
    !!disciplineConventions.ethical_considerations

  // Summary generators
  const getAIPolicySummary = () => {
    if (!aiPolicy.course_level) return undefined
    return AI_POLICY_LEVELS.find((p) => p.value === aiPolicy.course_level)?.label
  }

  const getLearnerProfileSummary = () => {
    if (!learnerProfile.type) return undefined
    return LEARNER_TYPES.find((t) => t.value === learnerProfile.type)?.label
  }

  const getTeachingApproachSummary = () => {
    if (!teachingApproach.primary) return undefined
    const primary = TEACHING_APPROACHES.find((a) => a.value === teachingApproach.primary)?.label
    const secondaryCount = teachingApproach.secondary?.length || 0
    if (secondaryCount > 0) {
      return `${primary} + ${secondaryCount} more`
    }
    return primary
  }

  const getInstructorPersonaSummary = () => {
    const parts: string[] = []
    if (instructorPersona.formality) {
      parts.push(FORMALITY_OPTIONS.find((o) => o.value === instructorPersona.formality)?.label || '')
    }
    if (instructorPersona.encouragement_style) {
      parts.push(
        ENCOURAGEMENT_OPTIONS.find((o) => o.value === instructorPersona.encouragement_style)?.label || ''
      )
    }
    if (instructorPersona.feedback_approach) {
      parts.push(
        FEEDBACK_OPTIONS.find((o) => o.value === instructorPersona.feedback_approach)?.label || ''
      )
    }
    return parts.length > 0 ? parts.join(', ') : undefined
  }

  const getDisciplineConventionsSummary = () => {
    if (disciplineConventions.citation_style) {
      return disciplineConventions.citation_style
    }
    return undefined
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Context Layer</h1>
        <p className="text-gray-600 mt-1">
          Provide context that helps AI understand how to engage with your course.
        </p>
      </div>

      {/* AI Policy - Required */}
      <CollapsibleSection
        id="ai-policy"
        title="AI Use Policy"
        isExpanded={expandedSections.has('ai-policy')}
        onToggle={() => toggleSection('ai-policy')}
        isComplete={hasAIPolicy}
        required
        summary={getAIPolicySummary()}
      >
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
      </CollapsibleSection>

      {/* Learner Profile */}
      <CollapsibleSection
        id="learner-profile"
        title="Learner Profile"
        isExpanded={expandedSections.has('learner-profile')}
        onToggle={() => toggleSection('learner-profile')}
        isComplete={hasLearnerProfile}
        summary={getLearnerProfileSummary()}
      >
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
      </CollapsibleSection>

      {/* Teaching Approach */}
      <CollapsibleSection
        id="teaching-approach"
        title="Teaching Approach"
        isExpanded={expandedSections.has('teaching-approach')}
        onToggle={() => toggleSection('teaching-approach')}
        isComplete={hasTeachingApproach}
        summary={getTeachingApproachSummary()}
      >
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
              {TEACHING_APPROACHES.filter((a) => a.value !== teachingApproach.primary).map((approach) => (
                <label key={approach.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={teachingApproach.secondary?.includes(approach.value) || false}
                    onChange={(e) => {
                      const current = teachingApproach.secondary || []
                      if (e.target.checked) {
                        updateTeachingApproach({ secondary: [...current, approach.value] })
                      } else {
                        updateTeachingApproach({ secondary: current.filter((v) => v !== approach.value) })
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
      </CollapsibleSection>

      {/* Instructor Persona */}
      <CollapsibleSection
        id="instructor-persona"
        title="Instructor Persona"
        isExpanded={expandedSections.has('instructor-persona')}
        onToggle={() => toggleSection('instructor-persona')}
        isComplete={hasInstructorPersona}
        summary={getInstructorPersonaSummary()}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            How should AI represent your voice when co-teaching?
          </p>

          {/* Inline chip-style selects */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-gray-600">Formality:</span>
              <select
                value={instructorPersona.formality || ''}
                onChange={(e) => updateInstructorPersona({ formality: e.target.value as Formality })}
                className="text-sm border-0 bg-transparent focus:ring-0 py-0 pl-0 pr-6 text-gray-900 font-medium cursor-pointer"
              >
                <option value="">Select</option>
                {FORMALITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-gray-600">Encouragement:</span>
              <select
                value={instructorPersona.encouragement_style || ''}
                onChange={(e) =>
                  updateInstructorPersona({ encouragement_style: e.target.value as EncouragementStyle })
                }
                className="text-sm border-0 bg-transparent focus:ring-0 py-0 pl-0 pr-6 text-gray-900 font-medium cursor-pointer"
              >
                <option value="">Select</option>
                {ENCOURAGEMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-gray-600">Feedback:</span>
              <select
                value={instructorPersona.feedback_approach || ''}
                onChange={(e) =>
                  updateInstructorPersona({ feedback_approach: e.target.value as FeedbackApproach })
                }
                className="text-sm border-0 bg-transparent focus:ring-0 py-0 pl-0 pr-6 text-gray-900 font-medium cursor-pointer"
              >
                <option value="">Select</option>
                {FEEDBACK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Discipline Conventions */}
      <CollapsibleSection
        id="discipline-conventions"
        title="Discipline Conventions"
        isExpanded={expandedSections.has('discipline-conventions')}
        onToggle={() => toggleSection('discipline-conventions')}
        isComplete={hasDisciplineConventions}
        summary={getDisciplineConventionsSummary()}
      >
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
      </CollapsibleSection>

      <StepNavigation onNext={handleSaveAndContinue} nextDisabled={!hasAIPolicy} />
    </div>
  )
}
