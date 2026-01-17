'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, Badge, Button, Input } from '@/components/ui'
import { StepNavigation } from '@/components/layout'
import { useContextStore, useKnowledgeGraphStore, useUIStore } from '@/stores'
import type { PrerequisiteCourse, PrerequisiteSkill, PrerequisiteKnowledge } from '@/types/schema'

export default function UnpackStep4() {
  const router = useRouter()
  const { prerequisites, updatePrerequisites } = useContextStore()
  const { metadata } = useKnowledgeGraphStore()
  const { markStepCompleted, setCurrentStep } = useUIStore()

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
            <Button variant="outline" size="sm" onClick={addSkill}>
              Add Skill
            </Button>
          </div>

          {(prerequisites.skills || []).length === 0 ? (
            <p className="text-sm text-gray-400 italic">No prerequisite skills specified</p>
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

          {(prerequisites.knowledge || []).length === 0 ? (
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
