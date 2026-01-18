'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button } from '@/components/ui'
import { StepNavigation } from '@/components/layout'
import { AssessmentCard, AssessmentForm } from '@/components/assess'
import {
  useUIStore,
  useAssessmentStore,
  useCourseStore,
  useModuleStore,
  generateAssessmentId,
} from '@/stores'
import type { Assessment } from '@/types/schema'

export default function UnpackStep4() {
  const router = useRouter()
  const { markStepCompleted, setCurrentStep } = useUIStore()
  const { course, coreCompetency } = useCourseStore()
  const { modules } = useModuleStore()
  const {
    assessments,
    addAssessment,
    updateAssessment,
    removeAssessment,
    setAssessments,
  } = useAssessmentStore()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  const assessmentList = Array.from(assessments.values())

  // Handle generate assessments from course structure
  const handleGenerateAssessments = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      const response = await fetch('/api/generate/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle: course.title || 'Course',
          coreCompetency: coreCompetency?.statement || '',
          modules: modules.map(m => ({
            id: m.id,
            title: m.title,
            learning_outcome: m.learning_outcome,
            bloom_level: m.bloom_level,
          })),
          existingAssessments: assessmentList.map(a => ({
            name: a.name,
            type: a.type,
            weight: a.weight,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate assessments')
      }

      const data = await response.json()
      if (data.assessments && Array.isArray(data.assessments)) {
        // Assign unique IDs to generated assessments
        const assessmentsWithIds = data.assessments.map((a: Partial<Assessment>) => ({
          ...a,
          id: a.id || generateAssessmentId(),
        }))
        // Merge with existing assessments
        const combined = [...assessmentList, ...assessmentsWithIds]
        setAssessments(combined)
      }
    } catch (error) {
      console.error('Generate assessments error:', error)
      setGenerationError('Failed to generate assessments. Please try again or add manually.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle add/edit assessment
  const handleSaveAssessment = (data: Partial<Assessment>) => {
    if (editingId) {
      updateAssessment(editingId, data)
      setEditingId(null)
    } else {
      const newAssessment: Assessment = {
        ...data,
        id: generateAssessmentId(),
        name: data.name || 'New Assessment',
        type: data.type || 'written',
        weight: data.weight || 0,
      } as Assessment
      addAssessment(newAssessment)
    }
    setShowForm(false)
  }

  // Handle edit
  const handleEdit = (id: string) => {
    setEditingId(id)
    setShowForm(true)
  }

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this assessment?')) {
      removeAssessment(id)
    }
  }

  const handleSaveAndContinue = () => {
    markStepCompleted(4)
    setCurrentStep(5)
    router.push('/unpack/prerequisites')
  }

  const editingAssessment = editingId ? assessments.get(editingId) : undefined

  // Calculate total weight
  const totalWeight = assessmentList.reduce((sum, a) => sum + (a.weight || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Assessments</h1>
        <p className="text-gray-600 mt-1">
          Review the extracted assessments and add any that were missed. These will carry over to Assess mode.
        </p>
      </div>

      {/* Orientation Card */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-xs font-medium">?</span>
          </div>
          <p className="text-sm text-gray-700">
            Assessments were extracted from your syllabus during upload. Review them here and link them to modules.
            If your syllabus didn&apos;t have detailed assessment info, you can <span className="font-medium">generate suggestions</span> based on your course structure.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setEditingId(null)
            setShowForm(true)
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Assessment
        </Button>
        {assessmentList.length < 2 && modules.length > 0 && (
          <Button
            variant="primary"
            onClick={handleGenerateAssessments}
            isLoading={isGenerating}
            disabled={isGenerating}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Generate from Course Structure
          </Button>
        )}
      </div>

      {/* Generation Error */}
      {generationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {generationError}
        </div>
      )}

      {/* Assessment Form Modal */}
      {showForm && (
        <Card variant="bordered">
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Assessment' : 'Add Assessment'}
            </h3>
            <AssessmentForm
              assessment={editingAssessment}
              onSave={handleSaveAssessment}
              onCancel={() => {
                setShowForm(false)
                setEditingId(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Assessment List */}
      {!showForm && (
        <div className="space-y-3">
          {assessmentList.length === 0 ? (
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
                <p className="text-gray-500 mb-4">
                  No assessments were extracted from your syllabus.
                  Generate suggestions based on your course structure or add them manually.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>{assessmentList.length} {assessmentList.length === 1 ? 'assessment' : 'assessments'}</span>
                <span className={totalWeight !== 100 ? 'text-amber-600 font-medium' : ''}>
                  Total weight: {totalWeight}%
                  {totalWeight !== 100 && ' (should be 100%)'}
                </span>
              </div>
              {assessmentList.map((assessment) => (
                <AssessmentCard
                  key={assessment.id}
                  assessment={assessment}
                  onEdit={() => handleEdit(assessment.id)}
                  onDelete={() => handleDelete(assessment.id)}
                />
              ))}
            </>
          )}
        </div>
      )}

      <StepNavigation
        onNext={handleSaveAndContinue}
        nextDisabled={showForm}
        nextLabel="Continue to Prerequisites"
      />
    </div>
  )
}
