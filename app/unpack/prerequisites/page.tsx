'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Badge, Button, Input } from '@/components/ui'
import { StepNavigation } from '@/components/layout'
import { useContextStore, useUIStore, useCourseStore, useKnowledgeGraphStore } from '@/stores'
import { generateNodeId, generateEdgeId } from '@/stores/knowledge-graph-store'
import type { PrerequisiteCourse, PrerequisiteSkill, PrerequisiteKnowledge, KnowledgeNode, ProficiencyLevel } from '@/types/schema'

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
  const { prerequisites, updatePrerequisites, setPrerequisites } = useContextStore()
  const { markStepCompleted, setCurrentStep } = useUIStore()
  const { syllabusText, course } = useCourseStore()
  const {
    nodes,
    edges,
    externalNodes,
    addExternalNode,
    addEdge,
    removeNode,
    migratePrerequisites,
    getEntryPoints,
  } = useKnowledgeGraphStore()

  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [hasMigrated, setHasMigrated] = useState(false)

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  // Migrate old prerequisites from context-store to knowledge graph on mount
  useEffect(() => {
    if (hasMigrated) return
    const hasOldPrereqs =
      (prerequisites.courses && prerequisites.courses.length > 0) ||
      (prerequisites.skills && prerequisites.skills.length > 0) ||
      (prerequisites.knowledge && prerequisites.knowledge.length > 0)

    if (hasOldPrereqs && externalNodes.size === 0) {
      // Migrate old prerequisites to knowledge graph
      migratePrerequisites(prerequisites as any)
      // Clear context-store prerequisites (data now in graph)
      setPrerequisites({})
    }
    setHasMigrated(true)
  }, [prerequisites, externalNodes.size, migratePrerequisites, setPrerequisites, hasMigrated])

  // Derive prerequisites from external nodes for display
  const derivedPrerequisites = useMemo(() => {
    const courses: PrerequisiteCourse[] = []
    const skills: PrerequisiteSkill[] = []
    const knowledge: PrerequisiteKnowledge[] = []

    // Group external concept nodes by course
    const courseMap = new Map<string, PrerequisiteCourse>()

    Array.from(externalNodes.values()).forEach((node) => {
      if (node.type === 'external_concept' && node.external_source?.type === 'course') {
        const courseCode = node.external_source.course_code || 'UNKNOWN'
        const existing = courseMap.get(courseCode)
        if (existing) {
          if (!existing.concepts_assumed) existing.concepts_assumed = []
          existing.concepts_assumed.push(node.label)
        } else {
          courseMap.set(courseCode, {
            code: courseCode,
            title: node.external_source.course_title,
            required: node.external_source.required,
            concepts_assumed: [node.label],
          })
        }
      } else if (node.type === 'external_skill' && node.external_source?.type === 'skill') {
        skills.push({
          skill: node.label,
          proficiency_level: node.external_source.proficiency_level,
          required: node.external_source.required,
        })
      } else if (node.type === 'external_knowledge' && node.external_source?.type === 'knowledge_area') {
        knowledge.push({
          area: node.label,
          description: node.description,
          required: node.external_source.required,
        })
      }
    })

    return {
      courses: Array.from(courseMap.values()),
      skills,
      knowledge,
    }
  }, [externalNodes])

  // Find the first internal node to link external nodes to
  const firstEntryNodeId = useMemo(() => {
    const entryPoints = getEntryPoints()
    if (entryPoints.length > 0) return entryPoints[0].id
    // Fallback: find first node from Module 1
    const module1Nodes = Array.from(nodes.values()).filter(
      (n) => n.parent_module_id && (n.parent_module_id.includes('1') || n.parent_module_id.includes('demo-1'))
    )
    return module1Nodes.length > 0 ? module1Nodes[0].id : null
  }, [nodes, getEntryPoints])

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

  // Helper to create an external node and link it to entry point
  const createExternalNodeWithEdge = (node: KnowledgeNode) => {
    addExternalNode(node)
    if (firstEntryNodeId) {
      addEdge({
        id: generateEdgeId(),
        source: node.id,
        target: firstEntryNodeId,
        relationship: 'assumed_by',
        strength: node.external_source?.required ? 'required' : 'recommended',
        source_type: 'faculty_defined',
        confirmed: true,
      })
    }
  }

  const acceptSkill = (suggestion: SuggestedSkill) => {
    const nodeId = generateNodeId('external_skill')
    createExternalNodeWithEdge({
      id: nodeId,
      type: 'external_skill',
      label: suggestion.skill,
      description: `Required proficiency: ${suggestion.proficiency_level}`,
      source: 'ai_extracted',
      confirmed: true,
      external_source: {
        type: 'skill',
        proficiency_level: suggestion.proficiency_level,
        required: true,
      },
    })
    setSuggestedSkills(suggestedSkills.filter((s) => s.skill !== suggestion.skill))
  }

  const dismissSkill = (skill: string) => {
    setSuggestedSkills(suggestedSkills.filter((s) => s.skill !== skill))
  }

  const acceptKnowledge = (suggestion: SuggestedKnowledge) => {
    const nodeId = generateNodeId('external_knowledge')
    createExternalNodeWithEdge({
      id: nodeId,
      type: 'external_knowledge',
      label: suggestion.area,
      description: suggestion.description,
      source: 'ai_extracted',
      confirmed: true,
      external_source: {
        type: 'knowledge_area',
        required: false,
      },
    })
    setSuggestedKnowledge(suggestedKnowledge.filter((k) => k.area !== suggestion.area))
  }

  const dismissKnowledge = (area: string) => {
    setSuggestedKnowledge(suggestedKnowledge.filter((k) => k.area !== area))
  }

  // Track temporary courses being added (before they have a code)
  const [tempCourses, setTempCourses] = useState<PrerequisiteCourse[]>([])

  const addCourse = () => {
    setTempCourses([...tempCourses, { code: '', title: '', required: true, concepts_assumed: [] }])
  }

  const updateTempCourse = (index: number, updates: Partial<PrerequisiteCourse>) => {
    const current = [...tempCourses]
    current[index] = { ...current[index], ...updates }
    setTempCourses(current)
  }

  const saveTempCourse = (index: number) => {
    const course = tempCourses[index]
    if (!course.code) return

    const nodeId = generateNodeId('external_concept')
    createExternalNodeWithEdge({
      id: nodeId,
      type: 'external_concept',
      label: `${course.code}${course.title ? `: ${course.title}` : ''}`,
      description: course.title || `Prerequisite course ${course.code}`,
      source: 'faculty_defined',
      confirmed: true,
      external_source: {
        type: 'course',
        course_code: course.code,
        course_title: course.title,
        required: course.required,
      },
    })

    // Remove from temp list
    const newTempCourses = [...tempCourses]
    newTempCourses.splice(index, 1)
    setTempCourses(newTempCourses)
  }

  const removeTempCourse = (index: number) => {
    const current = [...tempCourses]
    current.splice(index, 1)
    setTempCourses(current)
  }

  const removeExternalCourse = (courseCode: string) => {
    // Find and remove all external nodes with this course code
    Array.from(externalNodes.values())
      .filter((n) => n.external_source?.course_code === courseCode)
      .forEach((n) => removeNode(n.id))
  }

  // Track temporary skills
  const [tempSkills, setTempSkills] = useState<PrerequisiteSkill[]>([])

  const addSkill = () => {
    setTempSkills([...tempSkills, { skill: '', proficiency_level: 'basic', required: true }])
  }

  const updateTempSkill = (index: number, updates: Partial<PrerequisiteSkill>) => {
    const current = [...tempSkills]
    current[index] = { ...current[index], ...updates }
    setTempSkills(current)
  }

  const saveTempSkill = (index: number) => {
    const skill = tempSkills[index]
    if (!skill.skill) return

    const nodeId = generateNodeId('external_skill')
    createExternalNodeWithEdge({
      id: nodeId,
      type: 'external_skill',
      label: skill.skill,
      description: skill.proficiency_level ? `Required proficiency: ${skill.proficiency_level}` : undefined,
      source: 'faculty_defined',
      confirmed: true,
      external_source: {
        type: 'skill',
        proficiency_level: skill.proficiency_level,
        required: skill.required,
      },
    })

    const newTempSkills = [...tempSkills]
    newTempSkills.splice(index, 1)
    setTempSkills(newTempSkills)
  }

  const removeTempSkill = (index: number) => {
    const current = [...tempSkills]
    current.splice(index, 1)
    setTempSkills(current)
  }

  const removeExternalSkill = (skillLabel: string) => {
    Array.from(externalNodes.values())
      .filter((n) => n.type === 'external_skill' && n.label === skillLabel)
      .forEach((n) => removeNode(n.id))
  }

  // Track temporary knowledge areas
  const [tempKnowledge, setTempKnowledge] = useState<PrerequisiteKnowledge[]>([])

  const addKnowledge = () => {
    setTempKnowledge([...tempKnowledge, { area: '', description: '', required: false }])
  }

  const updateTempKnowledge = (index: number, updates: Partial<PrerequisiteKnowledge>) => {
    const current = [...tempKnowledge]
    current[index] = { ...current[index], ...updates }
    setTempKnowledge(current)
  }

  const saveTempKnowledge = (index: number) => {
    const knowledge = tempKnowledge[index]
    if (!knowledge.area) return

    const nodeId = generateNodeId('external_knowledge')
    createExternalNodeWithEdge({
      id: nodeId,
      type: 'external_knowledge',
      label: knowledge.area,
      description: knowledge.description,
      source: 'faculty_defined',
      confirmed: true,
      external_source: {
        type: 'knowledge_area',
        required: knowledge.required,
      },
    })

    const newTempKnowledge = [...tempKnowledge]
    newTempKnowledge.splice(index, 1)
    setTempKnowledge(newTempKnowledge)
  }

  const removeTempKnowledge = (index: number) => {
    const current = [...tempKnowledge]
    current.splice(index, 1)
    setTempKnowledge(current)
  }

  const removeExternalKnowledge = (area: string) => {
    Array.from(externalNodes.values())
      .filter((n) => n.type === 'external_knowledge' && n.label === area)
      .forEach((n) => removeNode(n.id))
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

          {derivedPrerequisites.courses.length === 0 && tempCourses.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No prerequisite courses specified</p>
          ) : (
            <div className="space-y-3">
              {/* Existing courses from knowledge graph */}
              {derivedPrerequisites.courses.map((course, index) => (
                <div key={`saved-${course.code}`} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="font-medium w-32">{course.code}</span>
                  <span className="flex-1 text-gray-600">{course.title}</span>
                  <Badge variant="secondary">{course.required ? 'Required' : 'Recommended'}</Badge>
                  <button
                    onClick={() => removeExternalCourse(course.code)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {/* Temporary courses being added */}
              {tempCourses.map((course, index) => (
                <div key={`temp-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Input
                    placeholder="Course code (e.g., MATH 101)"
                    value={course.code}
                    onChange={(e) => updateTempCourse(index, { code: e.target.value })}
                    className="w-32"
                  />
                  <Input
                    placeholder="Course title"
                    value={course.title || ''}
                    onChange={(e) => updateTempCourse(index, { title: e.target.value })}
                    className="flex-1"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={course.required}
                      onChange={(e) => updateTempCourse(index, { required: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Required
                  </label>
                  <button
                    onClick={() => saveTempCourse(index)}
                    className="text-green-600 hover:text-green-700"
                    title="Save course"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeTempCourse(index)}
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

          {derivedPrerequisites.skills.length === 0 && tempSkills.length === 0 && suggestedSkills.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No prerequisite skills specified. Try AI Suggest to get started.</p>
          ) : (
            <div className="space-y-3">
              {/* Existing skills from knowledge graph */}
              {derivedPrerequisites.skills.map((skill, index) => (
                <div key={`saved-${skill.skill}`} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="flex-1">{skill.skill}</span>
                  <Badge variant="secondary">{skill.proficiency_level || 'basic'}</Badge>
                  <Badge variant="secondary">{skill.required ? 'Required' : 'Recommended'}</Badge>
                  <button
                    onClick={() => removeExternalSkill(skill.skill)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {/* Temporary skills being added */}
              {tempSkills.map((skill, index) => (
                <div key={`temp-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Input
                    placeholder="Skill (e.g., Basic algebra)"
                    value={skill.skill}
                    onChange={(e) => updateTempSkill(index, { skill: e.target.value })}
                    className="flex-1"
                  />
                  <select
                    value={skill.proficiency_level || 'basic'}
                    onChange={(e) => updateTempSkill(index, { proficiency_level: e.target.value as ProficiencyLevel })}
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
                      onChange={(e) => updateTempSkill(index, { required: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Required
                  </label>
                  <button
                    onClick={() => saveTempSkill(index)}
                    className="text-green-600 hover:text-green-700"
                    title="Save skill"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeTempSkill(index)}
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

          {derivedPrerequisites.knowledge.length === 0 && tempKnowledge.length === 0 && suggestedKnowledge.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No background knowledge specified</p>
          ) : (
            <div className="space-y-3">
              {/* Existing knowledge from knowledge graph */}
              {derivedPrerequisites.knowledge.map((item, index) => (
                <div key={`saved-${item.area}`} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="w-48 font-medium">{item.area}</span>
                  <span className="flex-1 text-gray-600">{item.description}</span>
                  <Badge variant="secondary">{item.required ? 'Required' : 'Recommended'}</Badge>
                  <button
                    onClick={() => removeExternalKnowledge(item.area)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {/* Temporary knowledge being added */}
              {tempKnowledge.map((item, index) => (
                <div key={`temp-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Input
                    placeholder="Knowledge area"
                    value={item.area}
                    onChange={(e) => updateTempKnowledge(index, { area: e.target.value })}
                    className="w-48"
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={item.description || ''}
                    onChange={(e) => updateTempKnowledge(index, { description: e.target.value })}
                    className="flex-1"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.required}
                      onChange={(e) => updateTempKnowledge(index, { required: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Required
                  </label>
                  <button
                    onClick={() => saveTempKnowledge(index)}
                    className="text-green-600 hover:text-green-700"
                    title="Save knowledge"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeTempKnowledge(index)}
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
