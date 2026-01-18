'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { AssessStepNavigation } from '@/components/layout'
import { VulnerabilityBadge } from '@/components/assess'
import {
  useUIStore,
  useAssessmentStore,
  useRubricStore,
  useCourseStore,
} from '@/stores'
import type { RiskLevel, RubricCategory } from '@/types/schema'

// Category display info
const CATEGORY_INFO: Record<RubricCategory, { label: string; color: string }> = {
  content_mastery: { label: 'Content Mastery', color: 'bg-blue-100 text-blue-700' },
  process_quality: { label: 'Process Quality', color: 'bg-purple-100 text-purple-700' },
  metacognition: { label: 'Metacognition', color: 'bg-green-100 text-green-700' },
  ai_collaboration: { label: 'AI Collaboration', color: 'bg-amber-100 text-amber-700' },
  authentic_voice: { label: 'Authentic Voice', color: 'bg-pink-100 text-pink-700' },
  contextual_application: { label: 'Contextual Application', color: 'bg-teal-100 text-teal-700' },
}

export default function AssessStep5() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'summary' | 'json'>('summary')
  const { setAssessCurrentStep, markAssessStepCompleted } = useUIStore()
  const { course } = useCourseStore()
  const { assessments, alternatives } = useAssessmentStore()
  const { rubrics, getRubricForAssessment } = useRubricStore()

  // Set current step on mount
  useEffect(() => {
    setAssessCurrentStep(5)
  }, [setAssessCurrentStep])

  const assessmentList = Array.from(assessments.values())
  const rubricList = Array.from(rubrics.values())

  // Calculate statistics
  const stats = useMemo(() => {
    const riskCounts: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0 }
    let audited = 0
    let withAlternatives = 0
    let withRubrics = 0

    assessmentList.forEach((a) => {
      if (a.vulnerability_audit) {
        audited++
        riskCounts[a.vulnerability_audit.risk_level]++
      }
      if (alternatives.get(a.id)?.length) {
        withAlternatives++
      }
      if (getRubricForAssessment(a.id)) {
        withRubrics++
      }
    })

    return { riskCounts, audited, withAlternatives, withRubrics, total: assessmentList.length }
  }, [assessmentList, alternatives, getRubricForAssessment])

  // Build export document
  const exportDocument = useMemo(() => ({
    schema_version: '0.4',
    exported_at: new Date().toISOString(),
    tool: 'Course Architect - Assess Mode',
    course: {
      title: course.title || 'Untitled Course',
      code: course.code,
      discipline: course.discipline || 'General',
      level: course.level || 'introductory',
    },
    assessments: assessmentList.map((a) => ({
      ...a,
      alternatives: alternatives.get(a.id) || [],
    })),
    rubrics: rubricList,
    summary: {
      total_assessments: stats.total,
      audited: stats.audited,
      risk_distribution: stats.riskCounts,
      with_alternatives: stats.withAlternatives,
      with_rubrics: stats.withRubrics,
    },
  }), [course, assessmentList, rubricList, alternatives, stats])

  const jsonString = JSON.stringify(exportDocument, null, 2)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${course.code || 'course'}-assessments.json`
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review & Export</h1>
        <p className="text-gray-600 mt-1">
          Review your assessment audit results and export your redesigned assessments.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card variant="bordered">
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-accent-600">{stats.total}</div>
            <div className="text-sm text-gray-500">Assessments</div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-accent-600">{stats.audited}</div>
            <div className="text-sm text-gray-500">Audited</div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-accent-600">{stats.withAlternatives}</div>
            <div className="text-sm text-gray-500">With Alternatives</div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-accent-600">{stats.withRubrics}</div>
            <div className="text-sm text-gray-500">With Rubrics</div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card variant="bordered">
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-4">AI Vulnerability Distribution</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              {(['high', 'medium', 'low'] as RiskLevel[]).map((level) => {
                const count = stats.riskCounts[level]
                const percentage = stats.audited > 0 ? (count / stats.audited) * 100 : 0
                const colors = {
                  high: 'bg-red-500',
                  medium: 'bg-amber-500',
                  low: 'bg-green-500',
                }

                return (
                  <div key={level} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-gray-600 capitalize">{level}</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[level]} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-sm text-gray-600 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Tabs */}
      <Card variant="bordered">
        <CardContent>
          <Tabs
            defaultValue={viewMode}
            onValueChange={(v) => setViewMode(v as 'summary' | 'json')}
          >
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="summary">Summary View</TabsTrigger>
                <TabsTrigger value="json">JSON Output</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy JSON'}
                </Button>
                <Button variant="primary" size="sm" onClick={handleDownload} className="bg-accent-600 hover:bg-accent-700">
                  Download JSON
                </Button>
              </div>
            </div>

            <TabsContent value="summary">
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {assessmentList.map((assessment) => {
                  const alts = alternatives.get(assessment.id) || []
                  const acceptedAlt = alts.find((a) => a.accepted)
                  const rubric = getRubricForAssessment(assessment.id)

                  return (
                    <div key={assessment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{assessment.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{assessment.type.replace(/_/g, ' ')}</p>
                        </div>
                        {assessment.vulnerability_audit && (
                          <VulnerabilityBadge riskLevel={assessment.vulnerability_audit.risk_level} />
                        )}
                      </div>

                      {acceptedAlt && (
                        <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-medium text-green-700">Accepted Alternative</span>
                          </div>
                          <p className="text-sm text-green-800">{acceptedAlt.name}</p>
                          {acceptedAlt.authenticity_features && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {acceptedAlt.authenticity_features.map((f, i) => (
                                <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {rubric && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Rubric ({rubric.criteria.length} criteria)</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {rubric.criteria.map((c, i) => {
                              const catInfo = c.category ? CATEGORY_INFO[c.category] : null
                              return (
                                <span
                                  key={i}
                                  className={`text-xs px-2 py-0.5 rounded ${catInfo?.color || 'bg-gray-100 text-gray-700'}`}
                                >
                                  {c.name}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="json">
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto max-h-[500px] text-xs font-mono">
                  {jsonString}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* What to do with this file */}
      <Card variant="bordered">
        <CardContent>
          <h3 className="font-medium text-gray-900 mb-3">What can you do with this file?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-accent-600 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              <div>
                <span className="font-medium">Update Your Syllabus</span>
                <p className="text-gray-500">Use the redesigned assessments and rubrics to update your course materials.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent-600 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </span>
              <div>
                <span className="font-medium">Share with Colleagues</span>
                <p className="text-gray-500">Share your assessment audit findings and rubric designs with your department.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AssessStepNavigation
        showNext={false}
        backLabel="Back to Rubrics"
        onBack={() => router.push('/assess/rubrics')}
      />
    </div>
  )
}
