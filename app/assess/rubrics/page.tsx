'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button } from '@/components/ui'
import { AssessStepNavigation } from '@/components/layout'
import { AssessmentCard, RubricEditor } from '@/components/assess'
import {
  useUIStore,
  useAssessmentStore,
  useRubricStore,
  useCourseStore,
  useModuleStore,
  generateRubricId,
  DEFAULT_RUBRIC_LEVELS,
} from '@/stores'
import type { Rubric, RubricCriterion, RubricLevel } from '@/types/schema'

export default function AssessStep4() {
  const router = useRouter()
  const { setAssessCurrentStep } = useUIStore()
  const { course } = useCourseStore()
  const { modules } = useModuleStore()
  const {
    assessments,
    selectedAssessmentId,
    setSelectedAssessmentId,
    alternatives,
  } = useAssessmentStore()
  const {
    rubrics,
    addRubric,
    updateCriterion,
    addCriterion,
    removeCriterion,
    updateLevel,
    getRubricForAssessment,
    isGenerating,
    setIsGenerating,
  } = useRubricStore()

  const [generateError, setGenerateError] = useState<string | null>(null)

  // Set current step on mount
  useEffect(() => {
    setAssessCurrentStep(4)
  }, [setAssessCurrentStep])

  const assessmentList = Array.from(assessments.values())
  const selectedAssessment = selectedAssessmentId ? assessments.get(selectedAssessmentId) : null
  const selectedAlternatives = selectedAssessmentId ? alternatives.get(selectedAssessmentId) : []

  // Get rubric for selected assessment
  const currentRubric = selectedAssessmentId ? getRubricForAssessment(selectedAssessmentId) : undefined

  // Count assessments with rubrics
  const withRubricsCount = assessmentList.filter((a) => getRubricForAssessment(a.id)).length

  // Generate rubric for an assessment
  const handleGenerateRubric = async () => {
    if (!selectedAssessment) return

    setIsGenerating(true)
    setGenerateError(null)

    // Get authenticity features from accepted alternatives
    const acceptedAlt = selectedAlternatives?.find((a) => a.accepted)
    const authenticityFeatures = acceptedAlt?.authenticity_features || selectedAssessment.authenticity_features || []

    // Build learning outcomes from modules
    const learningOutcomes = selectedAssessment.module_ids
      ?.map((id) => modules.find((m) => m.id === id)?.learning_outcome)
      .filter(Boolean)
      .join('\n') || 'Not specified'

    try {
      const response = await fetch('/api/assess/generate-rubric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentName: acceptedAlt?.name || selectedAssessment.name,
          assessmentType: acceptedAlt?.type || selectedAssessment.type,
          assessmentDescription: acceptedAlt?.description || selectedAssessment.description,
          authenticityFeatures,
          learningOutcomes,
          aiPolicy: acceptedAlt?.ai_policy || selectedAssessment.ai_policy || 'permitted_with_attribution',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate rubric')
      }

      const data = await response.json()
      if (data.criteria && Array.isArray(data.criteria)) {
        const newRubric: Rubric = {
          id: generateRubricId(),
          assessment_id: selectedAssessment.id,
          criteria: data.criteria.map((c: RubricCriterion) => ({
            ...c,
            levels: c.levels || [...DEFAULT_RUBRIC_LEVELS],
          })),
        }
        addRubric(newRubric)
      }
    } catch (error) {
      console.error('Generate rubric error:', error)
      setGenerateError('Failed to generate rubric. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle rubric updates
  const handleUpdateCriterion = (index: number, updates: Partial<RubricCriterion>) => {
    if (currentRubric) {
      updateCriterion(currentRubric.id, index, updates)
    }
  }

  const handleAddCriterion = (criterion: RubricCriterion) => {
    if (currentRubric) {
      addCriterion(currentRubric.id, criterion)
    }
  }

  const handleRemoveCriterion = (index: number) => {
    if (currentRubric) {
      removeCriterion(currentRubric.id, index)
    }
  }

  const handleUpdateLevel = (criterionIndex: number, levelIndex: number, updates: Partial<RubricLevel>) => {
    if (currentRubric) {
      updateLevel(currentRubric.id, criterionIndex, levelIndex, updates)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rubric Builder</h1>
        <p className="text-gray-600 mt-1">
          Create rubrics that evaluate authentic learning, not just content mastery.
        </p>
      </div>

      {/* AI Era Categories Info */}
      <Card variant="bordered" className="bg-accent-50 border-accent-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="text-sm text-gray-700">
              <p className="font-medium text-gray-900 mb-1">AI-Era Rubric Categories</p>
              <p>
                Beyond content mastery, consider evaluating: <strong>process quality</strong> (how work was done),
                <strong> metacognition</strong> (reflection on learning), <strong>AI collaboration</strong> (appropriate tool use),
                <strong> authentic voice</strong> (original perspective), and <strong>contextual application</strong> (real-world connection).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {generateError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {generateError}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-5 gap-6">
        {/* Left: Assessment List (narrower) */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Assessments</h3>
            <span className="text-xs text-gray-500">
              {withRubricsCount} / {assessmentList.length} with rubrics
            </span>
          </div>
          {assessmentList.map((assessment) => {
            const hasRubric = !!getRubricForAssessment(assessment.id)
            const hasAcceptedAlt = alternatives.get(assessment.id)?.some((a) => a.accepted)

            return (
              <div key={assessment.id} className="relative">
                <AssessmentCard
                  assessment={assessment}
                  isSelected={selectedAssessmentId === assessment.id}
                  onClick={() => setSelectedAssessmentId(assessment.id)}
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {hasRubric && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      Rubric
                    </span>
                  )}
                  {hasAcceptedAlt && (
                    <span className="text-xs bg-accent-100 text-accent-700 px-2 py-0.5 rounded">
                      Alt accepted
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Right: Rubric Editor (wider) */}
        <div className="col-span-3">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Rubric</h3>
          {selectedAssessment ? (
            <Card variant="bordered">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedAssessment.name}</h4>
                    {selectedAlternatives?.find((a) => a.accepted) && (
                      <p className="text-xs text-accent-600 mt-1">
                        Using accepted alternative: {selectedAlternatives.find((a) => a.accepted)?.name}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateRubric}
                    isLoading={isGenerating}
                    disabled={isGenerating}
                  >
                    {currentRubric ? 'Regenerate' : 'Generate'} Rubric
                  </Button>
                </div>

                {currentRubric ? (
                  <RubricEditor
                    rubric={currentRubric}
                    onUpdateCriterion={handleUpdateCriterion}
                    onAddCriterion={handleAddCriterion}
                    onRemoveCriterion={handleRemoveCriterion}
                    onUpdateLevel={handleUpdateLevel}
                  />
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <svg
                      className="w-12 h-12 text-gray-300 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    <p className="text-gray-500 mb-4">
                      No rubric yet. Generate one to get started.
                    </p>
                    <Button
                      variant="primary"
                      onClick={handleGenerateRubric}
                      isLoading={isGenerating}
                      disabled={isGenerating}
                      className="bg-accent-600 hover:bg-accent-700"
                    >
                      Generate AI-Era Rubric
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card variant="bordered" className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  Select an assessment to create or edit its rubric.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AssessStepNavigation
        onNext={() => router.push('/assess/export')}
        backLabel="Back to Alternatives"
        onBack={() => router.push('/assess/alternatives')}
      />
    </div>
  )
}
