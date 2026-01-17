'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Badge, Button, Input } from '@/components/ui'
import { StepNavigation } from '@/components/layout'
import { useContextStore, useKnowledgeGraphStore, useUIStore, useCourseStore } from '@/stores'
import type { PrerequisiteCourse, PrerequisiteSkill, PrerequisiteKnowledge } from '@/types/schema'

interface SuggestedSkill {
  skill: string
  proficiency_level: 'basic' | 'intermediate' | 'advanced'
  rationale: string
}

interface SuggestedKnowledge {
  area: string
  description: string
  rationale: string
}

export default function UnpackStep4() {
  const router = useRouter()
  const { prerequisites, updatePrerequisites } = useContextStore()
  const { metadata } = useKnowledgeGraphStore()
  const { markStepCompleted, setCurrentStep } = useUIStore()
  const { syllabusText, course } = useCourseStore()

  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])
  const [suggestedSkills, setSuggestedSkills] = useState<SuggestedSkill[]>([])
  const [suggestedKnowledge, setSuggestedKnowledge] = useState<SuggestedKnowledge[]>([])
  const [suggestionError, setSuggestionError] = useState<string | null>(null)

  const fetchSuggestions = useCallback(async () => {
    if (!syllabusText) {
      setSuggestionError('No syllabus text available')
      return
    }

    setIsLoadingSuggestions(true)
    setSuggestionError(null)

    try {
      const response = await fetch('/api/suggest/prerequisites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabusText,
          courseTitle: course.title,
          discipline: course.discipline,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate suggestions')
      }

      const data = await response.json()
      setSuggestedSkills(data.skills || [])
      setSuggestedKnowledge(data.knowledge || [])
    } catch (error) {
      console.error('Suggestion error:', error)
      setSuggestionError(error instanceof Error ? error.message : 'Failed to generate suggestions')
    } finally {
      setIsLoadingSuggestions(false)
    }
  }, [syllabusText, course.title, course.discipline])

  const acceptSkill = (suggestion: SuggestedSkill) => {
    const current = prerequisites.skills || []
    updatePrerequisites({
      skills: [...current, {
        skill: suggestion.skill,
        proficiency_level: suggestion.proficiency_level,
        required: true,
      }],
    })
    setSuggestedSkills(suggestedSkills.filter((s) => s.skill !== suggestion.skill))
  }

  const dismissSkill = (skill: string) => {
    setSuggestedSkills(suggestedSkills.filter((s) => s.skill !== skill))
  }

  const acceptKnowledge = (suggestion: SuggestedKnowledge) => {
    const current = prerequisites.knowledge || []
    updatePrerequisites({
      knowledge: [...current, {
        area: suggestion.area,
        description: suggestion.description,
        required: false,
      }],
    })
    setSuggestedKnowledge(suggestedKnowledge.filter((k) => k.area !== suggestion.area))
  }

  const dismissKnowledge = (area: string) => {
    setSuggestedKnowledge(suggestedKnowledge.filter((k) => k.area !== area))
  }

  const addCourse = () => {
    const current = prerequisites.courses || []
    updatePrerequisites({
      courses: [...current, { code: '', title: '', required: true, concepts_assumed: [] }],
    })
  }

  const updateCourse = (index: number, updates: Partial<PrerequisiteCourse>) => {
    const current = [...(prerequisites.courses || [])]
    current[index] = { ...current[index], ...updates }
    updatePrerequisites({ courses: current })
  }

  const removeCourse = (index: number) => {
    const current = [...(prerequisites.courses || [])]
    current.splice(index, 1)
    updatePrerequisites({ courses: current })
  }

  const addSkill = () => {
    const current = prerequisites.skills || []
    updatePrerequisites({
      skills: [...current, { skill: '', proficiency_level: 'basic', required: true }],
    })
  }

  const updateSkill = (index: number, updates: Partial<PrerequisiteSkill>) => {
    const current = [...(prerequisites.skills || [])]
    current[index] = { ...current[index], ...updates }
    updatePrerequisites({ skills: current })
  }

  const removeSkill = (index: number) => {
    const current = [...(prerequisites.skills || [])]
    current.splice(index, 1)
    updatePrerequisites({ skills: current })
  }

  const addKnowledge = () => {
    const current = prerequisites.knowledge || []
    updatePrerequisites({
      knowledge: [...current, { area: '', description: '', required: false }],
    })
  }

  const updateKnowledge = (index: number, updates: Partial<PrerequisiteKnowledge>) => {
    const current = [...(prerequisites.knowledge || [])]
    current[index] = { ...current[index], ...updates }
    updatePrerequisites({ knowledge: current })
  }

  const removeKnowledge = (index: number) => {
    const current = [...(prerequisites.knowledge || [])]
    current.splice(index, 1)
    updatePrerequisites({ knowledge: current })
  }

  const handleSaveAndContinue = () => {
    markStepCompleted(4)
    setCurrentStep(5)
    router.push('/unpack/context')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Map Prerequisites</h1>
        <p className="text-gray-600 mt-1">
          Define what students should know or be able to do before starting this course.
        </p>
      </div>

      {/* Knowledge Graph Status */}
      <Card variant="bordered">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Knowledge Graph Status</h3>
              <p className="text-sm text-gray-500 mt-1">
                Internal concept dependencies have been extracted
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={metadata.is_dag_valid ? 'success' : 'error'}>
                {metadata.is_dag_valid ? 'Valid DAG' : 'Cycle Detected'}
              </Badge>
              <span className="text-sm text-gray-500">
                {metadata.node_count || 0} concepts, {metadata.edge_count || 0} relationships
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prerequisite Courses */}
      <Card variant="bordered">
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-gray-900">Prerequisite Courses</h3>
              <p className="text-sm text-gray-500">Courses students should have completed</p>
            </div>
            <Button variant="outline" size="sm" onClick={addCourse}>
              Add Course
            </Button>
          </div>

          {(prerequisites.courses || []).length === 0 ? (
            <p className="text-sm text-gray-400 italic">No prerequisite courses specified</p>
          ) : (
            <div className="space-y-3">
              {(prerequisites.courses || []).map((course, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Input
                    placeholder="Course code (e.g., MATH 101)"
                    value={course.code}
                    onChange={(e) => updateCourse(index, { code: e.target.value })}
                    className="w-32"
                  />
                  <Input
                    placeholder="Course title"
                    value={course.title || ''}
                    onChange={(e) => updateCourse(index, { title: e.target.value })}
                    className="flex-1"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={course.required}
                      onChange={(e) => updateCourse(index, { required: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Required
                  </label>
                  <button
                    onClick={() => removeCourse(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prerequisite Skills */}
      <Card variant="bordered">
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-gray-900">Required Skills</h3>
              <p className="text-sm text-gray-500">Skills students should already have</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSuggestions}
                disabled={isLoadingSuggestions || !syllabusText}
              >
                {isLoadingSuggestions ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  'AI Suggest'
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={addSkill}>
                Add Skill
              </Button>
            </div>
          </div>

          {suggestionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {suggestionError}
            </div>
          )}

          {/* AI Suggestions */}
          {suggestedSkills.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">AI Suggestions</p>
              {suggestedSkills.map((suggestion) => (
                <div key={suggestion.skill} className="flex items-start gap-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{suggestion.skill}</span>
                      <Badge variant="secondary">{suggestion.proficiency_level}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{suggestion.rationale}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => acceptSkill(suggestion)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Accept"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => dismissSkill(suggestion.skill)}
                      className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                      title="Dismiss"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(prerequisites.skills || []).length === 0 && suggestedSkills.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No prerequisite skills specified. Try AI Suggest to get started.</p>
          ) : (
            <div className="space-y-3">
              {(prerequisites.skills || []).map((skill, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Input
                    placeholder="Skill (e.g., Basic algebra)"
                    value={skill.skill}
                    onChange={(e) => updateSkill(index, { skill: e.target.value })}
                    className="flex-1"
                  />
                  <select
                    value={skill.proficiency_level || 'basic'}
                    onChange={(e) => updateSkill(index, { proficiency_level: e.target.value as 'basic' | 'intermediate' | 'advanced' })}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="basic">Basic</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={skill.required}
                      onChange={(e) => updateSkill(index, { required: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Required
                  </label>
                  <button
                    onClick={() => removeSkill(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Background Knowledge */}
      <Card variant="bordered">
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-gray-900">Background Knowledge</h3>
              <p className="text-sm text-gray-500">Assumed familiarity with topics</p>
            </div>
            <Button variant="outline" size="sm" onClick={addKnowledge}>
              Add Knowledge Area
            </Button>
          </div>

          {/* AI Suggestions for Knowledge */}
          {suggestedKnowledge.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">AI Suggestions</p>
              {suggestedKnowledge.map((suggestion) => (
                <div key={suggestion.area} className="flex items-start gap-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{suggestion.area}</span>
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{suggestion.rationale}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => acceptKnowledge(suggestion)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Accept"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => dismissKnowledge(suggestion.area)}
                      className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                      title="Dismiss"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(prerequisites.knowledge || []).length === 0 && suggestedKnowledge.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No background knowledge specified</p>
          ) : (
            <div className="space-y-3">
              {(prerequisites.knowledge || []).map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Input
                    placeholder="Knowledge area"
                    value={item.area}
                    onChange={(e) => updateKnowledge(index, { area: e.target.value })}
                    className="w-48"
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={item.description || ''}
                    onChange={(e) => updateKnowledge(index, { description: e.target.value })}
                    className="flex-1"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.required}
                      onChange={(e) => updateKnowledge(index, { required: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Required
                  </label>
                  <button
                    onClick={() => removeKnowledge(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <StepNavigation onNext={handleSaveAndContinue} />
    </div>
  )
}
