'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button } from '@/components/ui'
import { AssessStepNavigation } from '@/components/layout'
import { AssessmentCard, VulnerabilityBadge, VulnerabilityDetail } from '@/components/assess'
import {
  useUIStore,
  useAssessmentStore,
  useCourseStore,
} from '@/stores'
import type { Assessment, VulnerabilityAudit } from '@/types/schema'

export default function AssessStep2() {
  const router = useRouter()
  const { setAssessCurrentStep } = useUIStore()
  const { course } = useCourseStore()
  const {
    assessments,
    selectedAssessmentId,
    setSelectedAssessmentId,
    setVulnerabilityAudit,
    setIsAuditing,
    isAuditing,
  } = useAssessmentStore()

  const [auditError, setAuditError] = useState<string | null>(null)
  const [currentAuditResult, setCurrentAuditResult] = useState<VulnerabilityAudit & {
    dimension_explanations?: Record<string, string>
    strengths?: string[]
    vulnerabilities?: string[]
  } | null>(null)

  // Set current step on mount
  useEffect(() => {
    setAssessCurrentStep(2)
  }, [setAssessCurrentStep])

  const assessmentList = Array.from(assessments.values())
  const selectedAssessment = selectedAssessmentId ? assessments.get(selectedAssessmentId) : null

  // Count audited assessments
  const auditedCount = assessmentList.filter((a) => a.vulnerability_audit).length

  // Handle audit single assessment
  const handleAuditAssessment = async (assessment: Assessment) => {
    setIsAuditing(true)
    setAuditError(null)
    setSelectedAssessmentId(assessment.id)

    try {
      const response = await fetch('/api/assess/vulnerability-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentName: assessment.name,
          assessmentType: assessment.type,
          assessmentDescription: assessment.description,
          assessmentFormat: assessment.format,
          courseContext: `Course: ${course.title || 'Unknown'}, Discipline: ${course.discipline || 'Unknown'}, Level: ${course.level || 'Unknown'}`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to audit assessment')
      }

      const auditResult = await response.json()

      // Save to store
      setVulnerabilityAudit(assessment.id, {
        risk_level: auditResult.risk_level,
        dimensions: auditResult.dimensions,
        rationale: auditResult.rationale,
        audited_at: auditResult.audited_at,
      })

      // Set for display
      setCurrentAuditResult(auditResult)
    } catch (error) {
      console.error('Audit error:', error)
      setAuditError('Failed to audit assessment. Please try again.')
    } finally {
      setIsAuditing(false)
    }
  }

  // Handle audit all
  const handleAuditAll = async () => {
    const unaudited = assessmentList.filter((a) => !a.vulnerability_audit)
    for (const assessment of unaudited) {
      await handleAuditAssessment(assessment)
    }
  }

  // When selecting an assessment, show its existing audit
  useEffect(() => {
    if (selectedAssessment?.vulnerability_audit) {
      setCurrentAuditResult(selectedAssessment.vulnerability_audit as VulnerabilityAudit & {
        dimension_explanations?: Record<string, string>
        strengths?: string[]
        vulnerabilities?: string[]
      })
    } else {
      setCurrentAuditResult(null)
    }
  }, [selectedAssessment])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vulnerability Audit</h1>
        <p className="text-gray-600 mt-1">
          Analyze each assessment for AI vulnerability across five dimensions.
        </p>
      </div>

      {/* Progress */}
      <Card variant="bordered" className="bg-gray-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">{auditedCount}</span>
              <span className="text-gray-500"> / {assessmentList.length} assessments audited</span>
            </div>
            {auditedCount < assessmentList.length && (
              <Button
                variant="primary"
                onClick={handleAuditAll}
                isLoading={isAuditing}
                disabled={isAuditing}
                className="bg-accent-600 hover:bg-accent-700"
              >
                Audit All Remaining
              </Button>
            )}
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 transition-all"
              style={{ width: `${(auditedCount / assessmentList.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {auditError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {auditError}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Assessment List */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Assessments</h3>
          {assessmentList.map((assessment) => (
            <div key={assessment.id} className="relative">
              <AssessmentCard
                assessment={assessment}
                isSelected={selectedAssessmentId === assessment.id}
                onClick={() => setSelectedAssessmentId(assessment.id)}
                showVulnerability
              />
              {!assessment.vulnerability_audit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-3 right-3"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAuditAssessment(assessment)
                  }}
                  isLoading={isAuditing && selectedAssessmentId === assessment.id}
                  disabled={isAuditing}
                >
                  Audit
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Right: Audit Details */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Audit Results</h3>
          {selectedAssessment ? (
            <Card variant="bordered">
              <CardContent>
                <h4 className="font-semibold text-gray-900 mb-4">{selectedAssessment.name}</h4>

                {currentAuditResult ? (
                  <VulnerabilityDetail audit={currentAuditResult} />
                ) : (
                  <div className="text-center py-8">
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <p className="text-gray-500 mb-4">This assessment hasn&apos;t been audited yet.</p>
                    <Button
                      variant="primary"
                      onClick={() => handleAuditAssessment(selectedAssessment)}
                      isLoading={isAuditing}
                      disabled={isAuditing}
                      className="bg-accent-600 hover:bg-accent-700"
                    >
                      Run Audit
                    </Button>
                  </div>
                )}

                {currentAuditResult && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAuditAssessment(selectedAssessment)}
                      isLoading={isAuditing}
                      disabled={isAuditing}
                    >
                      Re-run Audit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card variant="bordered" className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  Select an assessment to view or run its vulnerability audit.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AssessStepNavigation
        nextDisabled={auditedCount === 0}
        onNext={() => router.push('/assess/alternatives')}
        backLabel="Back to Inventory"
        onBack={() => router.push('/assess')}
      />
    </div>
  )
}
