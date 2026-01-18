'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button } from '@/components/ui'
import { AssessStepNavigation } from '@/components/layout'
import { AssessmentCard, AssessmentForm } from '@/components/assess'
import {
  useUIStore,
  useAssessmentStore,
  useCourseStore,
  generateAssessmentId,
} from '@/stores'
import type { Assessment } from '@/types/schema'

export default function AssessStep1() {
  const router = useRouter()
  const { setAssessCurrentStep } = useUIStore()
  const { course } = useCourseStore()
  const {
    assessments,
    addAssessment,
    updateAssessment,
    removeAssessment,
    setAssessments,
    isAuditing,
  } = useAssessmentStore()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)

  // Set current step on mount
  useEffect(() => {
    setAssessCurrentStep(1)
  }, [setAssessCurrentStep])

  const assessmentList = Array.from(assessments.values())

  // Handle extract from syllabus
  const handleExtractAssessments = async () => {
    // Get syllabus text from localStorage (stored during Unpack)
    const syllabusText = localStorage.getItem('course-architect-syllabus')
    if (!syllabusText) {
      setExtractionError('No syllabus found. Please go through the Unpack flow first, or add assessments manually.')
      return
    }

    setIsExtracting(true)
    setExtractionError(null)

    try {
      const response = await fetch('/api/extract/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabusText,
          courseTitle: course.title || 'Course',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to extract assessments')
      }

      const data = await response.json()
      if (data.assessments && Array.isArray(data.assessments)) {
        // Assign unique IDs to extracted assessments
        const assessmentsWithIds = data.assessments.map((a: Partial<Assessment>, index: number) => ({
          ...a,
          id: a.id || generateAssessmentId(),
        }))
        setAssessments(assessmentsWithIds)
      }
    } catch (error) {
      console.error('Extract assessments error:', error)
      setExtractionError('Failed to extract assessments. Please try again or add manually.')
    } finally {
      setIsExtracting(false)
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

  const editingAssessment = editingId ? assessments.get(editingId) : undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assessment Inventory</h1>
        <p className="text-gray-600 mt-1">
          Catalog your course assessments to analyze for AI vulnerability.
        </p>
      </div>

      {/* Orientation Card */}
      <Card variant="bordered" className="bg-accent-50 border-accent-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm text-gray-700">
              <p className="font-medium text-gray-900 mb-1">What is this step?</p>
              <p>
                List all the assessments in your course - exams, papers, projects, presentations.
                You can extract them from your syllabus or add them manually.
                We&apos;ll then analyze each one for AI vulnerability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {assessmentList.length === 0 && (
          <Button
            variant="primary"
            onClick={handleExtractAssessments}
            isLoading={isExtracting}
            disabled={isExtracting}
            className="bg-accent-600 hover:bg-accent-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Extract from Syllabus
          </Button>
        )}
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
          Add Manually
        </Button>
        {assessmentList.length > 0 && (
          <Button
            variant="outline"
            onClick={handleExtractAssessments}
            isLoading={isExtracting}
            disabled={isExtracting}
          >
            Re-extract from Syllabus
          </Button>
        )}
      </div>

      {/* Extraction Error */}
      {extractionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {extractionError}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
                <p className="text-gray-500 mb-4">
                  Extract assessments from your syllabus or add them manually to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>{assessmentList.length} {assessmentList.length === 1 ? 'assessment' : 'assessments'}</span>
                <span>
                  Total weight: {assessmentList.reduce((sum, a) => sum + a.weight, 0)}%
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

      <AssessStepNavigation
        nextDisabled={assessmentList.length === 0 || showForm}
        onNext={() => router.push('/assess/audit')}
      />
    </div>
  )
}
