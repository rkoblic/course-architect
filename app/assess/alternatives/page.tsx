'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button } from '@/components/ui'
import { AssessStepNavigation } from '@/components/layout'
import { AssessmentCard, AlternativeCard, VulnerabilityBadge } from '@/components/assess'
import {
  useUIStore,
  useAssessmentStore,
  useCourseStore,
  useModuleStore,
  generateAlternativeId,
} from '@/stores'
import type { AlternativeAssessment } from '@/stores/assessment-store'
import type { Assessment } from '@/types/schema'

export default function AssessStep3() {
  const router = useRouter()
  const { setAssessCurrentStep } = useUIStore()
  const { course } = useCourseStore()
  const { modules } = useModuleStore()
  const {
    assessments,
    selectedAssessmentId,
    setSelectedAssessmentId,
    alternatives,
    setAlternatives,
    acceptAlternative,
    isGeneratingAlternatives,
    setIsGeneratingAlternatives,
  } = useAssessmentStore()

  const [generateError, setGenerateError] = useState<string | null>(null)

  // Set current step on mount
  useEffect(() => {
    setAssessCurrentStep(3)
  }, [setAssessCurrentStep])

  const assessmentList = Array.from(assessments.values())
  const selectedAssessment = selectedAssessmentId ? assessments.get(selectedAssessmentId) : null
  const currentAlternatives = selectedAssessmentId ? alternatives.get(selectedAssessmentId) : []

  // Focus on high-risk assessments
  const highRiskAssessments = assessmentList.filter(
    (a) => a.vulnerability_audit?.risk_level === 'high' || a.vulnerability_audit?.risk_level === 'medium'
  )

  // Count assessments with alternatives
  const withAlternativesCount = assessmentList.filter((a) => alternatives.get(a.id)?.length).length

  // Generate alternatives for an assessment
  const handleGenerateAlternatives = async (assessment: Assessment) => {
    setIsGeneratingAlternatives(true)
    setGenerateError(null)
    setSelectedAssessmentId(assessment.id)

    // Build learning outcomes from modules if linked
    const learningOutcomes = assessment.module_ids
      ?.map((id) => modules.find((m) => m.id === id)?.learning_outcome)
      .filter(Boolean)
      .join('\n') || 'Not specified'

    try {
      const response = await fetch('/api/assess/generate-alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentName: assessment.name,
          assessmentType: assessment.type,
          assessmentDescription: assessment.description,
          vulnerabilityRationale: assessment.vulnerability_audit?.rationale || 'Not audited',
          learningOutcomes,
          courseContext: `Course: ${course.title || 'Unknown'}, Discipline: ${course.discipline || 'Unknown'}, Level: ${course.level || 'Unknown'}`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate alternatives')
      }

      const data = await response.json()
      if (data.alternatives && Array.isArray(data.alternatives)) {
        const alternativesWithIds: AlternativeAssessment[] = data.alternatives.map((alt: Partial<AlternativeAssessment>) => ({
          ...alt,
          id: alt.id || generateAlternativeId(),
          original_assessment_id: assessment.id,
          accepted: false,
        }))
        setAlternatives(assessment.id, alternativesWithIds)
      }
    } catch (error) {
      console.error('Generate alternatives error:', error)
      setGenerateError('Failed to generate alternatives. Please try again.')
    } finally {
      setIsGeneratingAlternatives(false)
    }
  }

  // Accept an alternative
  const handleAcceptAlternative = (assessmentId: string, alternativeId: string) => {
    acceptAlternative(assessmentId, alternativeId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alternative Generation</h1>
        <p className="text-gray-600 mt-1">
          Generate authentic alternatives for your high-risk assessments.
        </p>
      </div>

      {/* Focus Card */}
      {highRiskAssessments.length > 0 && (
        <Card variant="bordered" className="bg-amber-50 border-amber-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-sm">
                <p className="font-medium text-amber-900 mb-1">
                  {highRiskAssessments.length} {highRiskAssessments.length === 1 ? 'assessment' : 'assessments'} flagged as medium or high risk
                </p>
                <p className="text-amber-700">
                  Consider generating alternatives for these assessments to make them more resistant to AI completion.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {generateError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {generateError}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Assessment List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Assessments</h3>
            <span className="text-xs text-gray-500">
              {withAlternativesCount} / {assessmentList.length} with alternatives
            </span>
          </div>
          {assessmentList.map((assessment) => {
            const hasAlts = alternatives.get(assessment.id)?.length ?? 0
            const riskLevel = assessment.vulnerability_audit?.risk_level

            return (
              <div key={assessment.id} className="relative">
                <AssessmentCard
                  assessment={assessment}
                  isSelected={selectedAssessmentId === assessment.id}
                  onClick={() => setSelectedAssessmentId(assessment.id)}
                  showVulnerability
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {hasAlts > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      {hasAlts} alternatives
                    </span>
                  )}
                  {(riskLevel === 'high' || riskLevel === 'medium') && !hasAlts && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGenerateAlternatives(assessment)
                      }}
                      isLoading={isGeneratingAlternatives && selectedAssessmentId === assessment.id}
                      disabled={isGeneratingAlternatives}
                    >
                      Generate
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Right: Alternatives */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Alternative Designs</h3>
          {selectedAssessment ? (
            <div className="space-y-4">
              {/* Original Assessment Summary */}
              <Card variant="bordered" className="bg-gray-50">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Original</span>
                      <h4 className="font-medium text-gray-900">{selectedAssessment.name}</h4>
                    </div>
                    {selectedAssessment.vulnerability_audit && (
                      <VulnerabilityBadge
                        riskLevel={selectedAssessment.vulnerability_audit.risk_level}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Alternatives List */}
              {currentAlternatives && currentAlternatives.length > 0 ? (
                <div className="space-y-3">
                  {currentAlternatives.map((alt) => (
                    <AlternativeCard
                      key={alt.id}
                      alternative={alt}
                      isAccepted={alt.accepted}
                      onAccept={() => handleAcceptAlternative(selectedAssessment.id, alt.id)}
                    />
                  ))}

                  <Button
                    variant="outline"
                    onClick={() => handleGenerateAlternatives(selectedAssessment)}
                    isLoading={isGeneratingAlternatives}
                    disabled={isGeneratingAlternatives}
                    className="w-full"
                  >
                    Regenerate Alternatives
                  </Button>
                </div>
              ) : (
                <Card variant="bordered" className="border-dashed">
                  <CardContent className="py-12 text-center">
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
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <p className="text-gray-500 mb-4">
                      No alternatives generated yet for this assessment.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => handleGenerateAlternatives(selectedAssessment)}
                      isLoading={isGeneratingAlternatives}
                      disabled={isGeneratingAlternatives}
                      className="bg-accent-600 hover:bg-accent-700"
                    >
                      Generate Alternatives
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card variant="bordered" className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  Select an assessment to generate or view alternatives.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AssessStepNavigation
        onNext={() => router.push('/assess/rubrics')}
        backLabel="Back to Audit"
        onBack={() => router.push('/assess/audit')}
      />
    </div>
  )
}
