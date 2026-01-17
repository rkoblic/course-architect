'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { StepNavigation } from '@/components/layout'
import {
  useCourseStore,
  useModuleStore,
  useKnowledgeGraphStore,
  useContextStore,
  useUIStore,
} from '@/stores'

export default function UnpackStep6() {
  const [copied, setCopied] = useState(false)
  const { exportViewMode, setExportViewMode, setCurrentStep } = useUIStore()

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(6)
  }, [setCurrentStep])

  const { course, coreCompetency } = useCourseStore()
  const { modules } = useModuleStore()
  const { nodes, edges, metadata } = useKnowledgeGraphStore()
  const { aiPolicy, learnerProfile, teachingApproach, instructorPersona, disciplineConventions, prerequisites } = useContextStore()

  // Build the export document (flexible structure for draft exports)
  const exportDocument = useMemo(() => ({
    schema_version: '0.4',
    exported_at: new Date().toISOString(),
    tool: 'Course Architect',
    course: {
      title: course.title || 'Untitled Course',
      code: course.code,
      institution: course.institution,
      discipline: course.discipline || 'General',
      subdiscipline: course.subdiscipline,
      level: course.level || 'introductory',
      credits: course.credits,
      duration: course.duration,
      delivery_mode: course.delivery_mode,
    },
    core_competency: {
      statement: coreCompetency.statement || '',
      type: coreCompetency.type || 'integrated',
    },
    modules: modules.map((m) => ({
      id: m.id,
      title: m.title,
      sequence: m.sequence,
      description: m.description,
      learning_outcome: m.learning_outcome || '',
      bloom_level: m.bloom_level || 'understand',
      ai_partnership_mode: m.ai_partnership_mode || 'collaborate',
      topics: m.topics || [],
      concept_ids: m.concept_ids,
    })),
    knowledge_graph: {
      nodes: Array.from(nodes.values()),
      edges: Array.from(edges.values()),
      metadata: {
        is_dag_valid: metadata.is_dag_valid ?? true,
        node_count: nodes.size,
        edge_count: edges.size,
      },
    },
    context: {
      ai_policy: {
        course_level: aiPolicy.course_level || 'open_use',
        details: aiPolicy.details,
        rationale: aiPolicy.rationale,
        skills_to_develop: aiPolicy.skills_to_develop,
        skills_to_delegate: aiPolicy.skills_to_delegate,
      },
      learner_profile: Object.keys(learnerProfile).length > 0 ? learnerProfile : undefined,
      teaching_approach: Object.keys(teachingApproach).length > 0 ? teachingApproach : undefined,
      instructor_persona: Object.keys(instructorPersona).length > 0 ? instructorPersona : undefined,
      discipline_conventions: Object.keys(disciplineConventions).length > 0 ? disciplineConventions : undefined,
    },
    prerequisites: Object.keys(prerequisites).length > 0 ? prerequisites : undefined,
  }), [course, coreCompetency, modules, nodes, edges, metadata, aiPolicy, learnerProfile, teachingApproach, instructorPersona, disciplineConventions, prerequisites])

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
    a.download = `${course.code || 'course'}-architect.json`
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
          Review your course structure and export as a machine-readable JSON document.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card variant="bordered">
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-primary-600">{modules.length}</div>
            <div className="text-sm text-gray-500">Modules</div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-primary-600">
              {modules.filter((m) => m.learning_outcome).length}
            </div>
            <div className="text-sm text-gray-500">Objectives</div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-primary-600">{nodes.size}</div>
            <div className="text-sm text-gray-500">Concepts</div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="text-center py-4">
            <div className="text-2xl font-bold text-primary-600">{edges.size}</div>
            <div className="text-sm text-gray-500">Relationships</div>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Card variant="bordered">
        <CardContent>
          <Tabs
            defaultValue={exportViewMode}
            onValueChange={(v) => setExportViewMode(v as 'instructor' | 'json')}
          >
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="instructor">Instructor View</TabsTrigger>
                <TabsTrigger value="json">JSON Output</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy JSON'}
                </Button>
                <Button variant="primary" size="sm" onClick={handleDownload}>
                  Download JSON
                </Button>
              </div>
            </div>

            <TabsContent value="instructor">
              <div className="space-y-6 max-h-[500px] overflow-y-auto">
                {/* Course Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Course Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div><span className="font-medium">Title:</span> {course.title || 'Not set'}</div>
                    <div><span className="font-medium">Code:</span> {course.code || 'Not set'}</div>
                    <div><span className="font-medium">Discipline:</span> {course.discipline || 'Not set'}</div>
                    <div><span className="font-medium">Level:</span> {course.level || 'Not set'}</div>
                  </div>
                </div>

                {/* Core Competency */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Core Competency</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="italic">{coreCompetency.statement || 'Not set'}</p>
                    <p className="text-sm text-gray-500 mt-1">Type: {coreCompetency.type || 'Not set'}</p>
                  </div>
                </div>

                {/* Modules Summary */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Modules ({modules.length})</h3>
                  <div className="space-y-2">
                    {modules.map((module) => (
                      <div key={module.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="font-medium">{module.sequence}. {module.title}</div>
                        <div className="text-sm text-gray-500">
                          {module.learning_outcome ? '1 outcome' : 'No outcome'}, {module.topics?.length || 0} topics
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Policy */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Policy</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div><span className="font-medium">Level:</span> {aiPolicy.course_level || 'Not set'}</div>
                    {aiPolicy.details && <div className="mt-2 text-sm">{aiPolicy.details}</div>}
                  </div>
                </div>
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

      <StepNavigation
        showNext={false}
        backLabel="Back to Context"
      />
    </div>
  )
}
